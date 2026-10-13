export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { users, wallets, transactions, notifications, payouts } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';
import { verifyPassword } from '@lib/password';
import { clientIp, rateLimit, tooManyRequests } from '@lib/rateLimit';
import {
  WITHDRAWAL_FEE_RATE,
  MIN_WITHDRAWAL_MWK,
  WITHDRAWAL_STEP_MWK,
  computeWithdrawal,
  validateWithdrawalAmount,
  normalizeMalawiPhone,
  resolveOperator,
  initiateMobilePayout,
  refundPayout,
} from '@lib/payouts';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Unguessable payout reference; doubles as the gateway's idempotency key. */
function newChargeId(): string {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('');
  return `WD-${random}`;
}

/**
 * POST /api/auth/withdraw
 *
 * Pays the member's earnings out to their mobile money wallet.
 *
 * The order matters and is the whole security story:
 *   1. debit the wallet inside a transaction, locking the row (`FOR UPDATE`)
 *      so two concurrent requests cannot both see the same balance;
 *   2. only then ask PayChangu to send the money, keyed by the payout's
 *      unique charge_id;
 *   3. if the gateway refuses, reverse the debit and credit the member back.
 *
 * Nothing is paid before it is recorded, and nothing is kept that was not paid.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return json({ success: false, message: 'Authentication required' }, 401);
    }

    // A withdrawal is a real payment, so throttle it per member and per address.
    const limit = rateLimit(
      `withdraw:${authUser.id}:${clientIp(request)}`,
      5,
      10 * 60 * 1000
    );
    if (!limit.allowed) {
      return tooManyRequests(limit.retryAfterSeconds, 'Too many withdrawal attempts. Please wait a few minutes.');
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const check = validateWithdrawalAmount((body as Record<string, unknown>)?.amount);
    if (!check.ok) {
      return json({ success: false, message: check.message }, 400);
    }
    const { amount } = check;

    // Confirm the password before moving money — a stolen session alone must
    // not be enough to drain the wallet.
    const password = String((body as Record<string, unknown>)?.password ?? '');
    if (!password) {
      return json({ success: false, message: 'Enter your password to confirm the withdrawal.' }, 400);
    }

    const accountRows = await db
      .select({
        id: users.id,
        phone: users.phone,
        payoutPhone: users.payoutPhone,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (accountRows.length === 0) {
      return json({ success: false, message: 'Account not found' }, 404);
    }
    const account = accountRows[0];

    const passwordOk = await verifyPassword(password, account.passwordHash);
    if (!passwordOk) {
      return json({ success: false, message: 'That password is not correct.' }, 401);
    }

    // Payout number: the member's chosen number, else the number on the account.
    const destination = account.payoutPhone || account.phone;
    const normalizedPhone = normalizeMalawiPhone(destination);
    if (!normalizedPhone) {
      return json({
        success: false,
        message: `${destination} is not a valid Malawian mobile number. Set a payout number before withdrawing.`,
        code: 'invalid_payout_number',
      }, 400);
    }

    const operator = await resolveOperator(normalizedPhone);
    if (!operator) {
      return json({
        success: false,
        message: 'We could not match that number to Airtel Money or TNM Mpamba.',
        code: 'invalid_payout_number',
      }, 400);
    }

    const { fee, net } = computeWithdrawal(amount);
    if (net < 1) {
      return json({ success: false, message: 'That amount is too small to withdraw.' }, 400);
    }

    const chargeId = newChargeId();

    /* ---- 1. Reserve: debit the wallet and record the payout atomically. ---- */

    let reserved: { payoutId: string; walletId: string; balanceAfter: number } | { error: string } | null =
      null;

    await db.transaction(async (tx: typeof db) => {
      // Lock the wallet row so concurrent requests serialise behind each other.
      const walletRows = await tx
        .select({ id: wallets.id, balance: wallets.balance })
        .from(wallets)
        .where(eq(wallets.userId, authUser.id))
        .limit(1)
        .for('update');

      if (walletRows.length === 0) {
        reserved = { error: 'Wallet not found' };
        return;
      }

      const wallet = walletRows[0];
      const balanceBefore = parseFloat(wallet.balance?.toString() || '0');

      if (balanceBefore < amount) {
        reserved = {
          error: `Insufficient balance. You have MWK ${balanceBefore.toLocaleString()} but requested MWK ${amount.toLocaleString()}.`,
        };
        return;
      }

      const balanceAfter = Math.round((balanceBefore - amount) * 100) / 100;

      await tx
        .update(wallets)
        .set({ balance: balanceAfter.toString(), updatedAt: new Date() })
        .where(eq(wallets.id, wallet.id));

      const [payoutRow] = await tx
        .insert(payouts)
        .values({
          userId: authUser.id,
          walletId: wallet.id,
          chargeId,
          grossAmount: amount.toString(),
          feeAmount: fee.toString(),
          netAmount: net.toString(),
          phone: normalizedPhone,
          operatorRefId: operator.refId,
          operatorName: operator.name,
          status: 'pending',
        })
        .returning({ id: payouts.id });

      await tx.insert(transactions).values({
        walletId: wallet.id,
        userId: authUser.id,
        transactionType: 'withdrawal',
        amount: amount.toString(),
        balanceBefore: balanceBefore.toString(),
        balanceAfter: balanceAfter.toString(),
        description: `Withdrawal of MWK ${amount.toLocaleString()} (fee MWK ${fee.toLocaleString()}, MWK ${net.toLocaleString()} sent to ${operator.name} ${normalizedPhone})`,
        transactionRef: chargeId,
      });

      reserved = { payoutId: payoutRow.id, walletId: wallet.id, balanceAfter };
    });

    if (!reserved) {
      return json({ success: false, message: 'Withdrawal could not be recorded. Please try again.' }, 500);
    }
    if ('error' in reserved) {
      const notFound = reserved.error === 'Wallet not found';
      return json({ success: false, message: reserved.error }, notFound ? 404 : 400);
    }

    /* ---- 2. Pay out. ---- */

    const outcome = await initiateMobilePayout({
      chargeId,
      normalizedPhone,
      operatorRefId: operator.refId,
      amount: net,
    });

    /* ---- 3. Settle. ---- */

    if (!outcome.ok && outcome.status === 'failed') {
      const reason = outcome.failureReason || 'The mobile money transfer was rejected.';
      await refundPayout(reserved.payoutId, reason);
      return json({
        success: false,
        message: `We could not send the payout (${reason}). Your MWK ${amount.toLocaleString()} has been returned to your wallet.`,
        refunded: true,
        newBalance: reserved.balanceAfter + amount,
        chargeId,
      }, 502);
    }

    // Either accepted (pending) or we could not tell — both stay 'pending' and
    // are reconciled against the gateway later, so we never lose a payout.
    if (outcome.gatewayRefId || outcome.gatewayTransId) {
      await db
        .update(payouts)
        .set({
          gatewayRefId: outcome.gatewayRefId ?? null,
          gatewayTransId: outcome.gatewayTransId ?? null,
          updatedAt: new Date(),
        })
        .where(eq(payouts.chargeId, chargeId));
    }

    await db.insert(notifications).values({
      userId: authUser.id,
      type: 'withdrawal',
      title: 'Withdrawal on its way',
      message: `MWK ${net.toLocaleString()} is being sent to ${operator.name} ${normalizedPhone}. A fee of MWK ${fee.toLocaleString()} (${Math.round(
        WITHDRAWAL_FEE_RATE * 100
      )}%) was deducted from your MWK ${amount.toLocaleString()}.`,
      link: '/member-access',
      isRead: false,
    });

    return json({
      success: true,
      message: `MWK ${net.toLocaleString()} is on its way to ${operator.name} ${normalizedPhone}.`,
      chargeId,
      gross: amount,
      fee,
      net,
      feeRate: WITHDRAWAL_FEE_RATE,
      operator: operator.name,
      phone: normalizedPhone,
      status: outcome.status,
      newBalance: reserved.balanceAfter,
      notice: outcome.ok
        ? null
        : 'The payout gateway did not confirm the transfer. We are checking its status and will return the funds if it did not go through.',
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return json({ success: false, message: 'Withdrawal failed' }, 500);
  }
};

/** GET /api/auth/withdraw — the current fee schedule, for the UI to render. */
export const GET: APIRoute = async ({ request }) => {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return json({ success: false, message: 'Authentication required' }, 401);
  }

  return json({
    success: true,
    feeRate: WITHDRAWAL_FEE_RATE,
    feePercent: Math.round(WITHDRAWAL_FEE_RATE * 100),
    minWithdrawal: MIN_WITHDRAWAL_MWK,
    step: WITHDRAWAL_STEP_MWK,
  });
};
