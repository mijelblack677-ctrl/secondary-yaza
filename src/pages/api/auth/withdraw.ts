export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { wallets, transactions, notifications } from '@lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Withdrawals run through the same wallet. MWK 500 minimum, always in 500 steps. */
const MIN_WITHDRAWAL_MWK = 500;

/** postgres-js returns a row list; normalise it to a plain array. */
function normalizeRows(result: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(result)) return result as Array<Record<string, unknown>>;
  const maybe = result as { rows?: Array<Record<string, unknown>> } | null;
  return maybe?.rows ?? [];
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return json({ success: false, message: 'Authentication required' }, 401);
    }

    const body = await request.json();
    const rawAmount = typeof body?.amount === 'number' ? body.amount : parseInt(String(body?.amount ?? ''), 10);
    const amount = Number.isFinite(rawAmount) ? Math.floor(rawAmount) : 0;

    if (!Number.isInteger(amount) || amount < MIN_WITHDRAWAL_MWK || amount % MIN_WITHDRAWAL_MWK !== 0) {
      return json({
        success: false,
        message: `Withdraw MWK ${MIN_WITHDRAWAL_MWK} minimum, in ${MIN_WITHDRAWAL_MWK} steps.`,
      }, 400);
    }

    // Debit the wallet with a single conditional UPDATE. The balance check and
    // the subtraction happen in one statement, so two concurrent withdrawal
    // requests cannot both pass a stale balance check and overdraw the wallet.
    const outcome = await db.transaction(async (tx: typeof db) => {
      const debited = await tx.execute(sql`
        UPDATE wallets
        SET balance = balance - ${amount}, updated_at = now()
        WHERE user_id = ${authUser.id} AND balance >= ${amount}
        RETURNING id, balance + ${amount} AS balance_before, balance AS balance_after
      `);

      const rows = normalizeRows(debited);
      if (rows.length === 0) return null;

      const row = rows[0];
      const walletId = String(row.id);

      await tx.insert(transactions).values({
        walletId,
        userId: authUser.id,
        transactionType: 'withdrawal',
        amount: amount.toString(),
        balanceBefore: String(row.balance_before),
        balanceAfter: String(row.balance_after),
        description: `Withdrawal of MWK ${amount.toLocaleString()}`,
      });

      await tx.insert(notifications).values({
        userId: authUser.id,
        type: 'withdrawal',
        title: 'Withdrawal completed',
        message: `You withdrew MWK ${amount.toLocaleString()} from your wallet.`,
        link: '/member-access',
        isRead: false,
      });

      return Number(row.balance_after);
    });

    if (outcome === null) {
      // No wallet row, or the balance was too low — read it back for the message.
      const current = await db
        .select({ balance: wallets.balance })
        .from(wallets)
        .where(eq(wallets.userId, authUser.id))
        .limit(1);

      if (current.length === 0) {
        return json({ success: false, message: 'Wallet not found' }, 404);
      }

      const balance = parseFloat(current[0].balance?.toString() || '0');
      return json({
        success: false,
        message: `Insufficient balance. You have MWK ${balance.toLocaleString()} but need MWK ${amount.toLocaleString()}.`,
      }, 400);
    }

    return json({
      success: true,
      message: `Withdrawn MWK ${amount.toLocaleString()} to your wallet.`,
      newBalance: outcome,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return json({ success: false, message: 'Withdrawal failed' }, 500);
  }
};
