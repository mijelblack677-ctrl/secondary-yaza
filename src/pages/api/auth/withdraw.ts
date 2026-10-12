export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { wallets, transactions, notifications } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Withdrawals run through the same wallet. MWK 500 minimum, always in 500 steps. */
const MIN_WITHDRAWAL_MWK = 500;

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

    // Take the balance out of the requesting user's wallet.
    const walletResult = await db
      .select({ id: wallets.id, balance: wallets.balance })
      .from(wallets)
      .where(eq(wallets.userId, authUser.id))
      .limit(1);

    if (walletResult.length === 0) {
      return json({ success: false, message: 'Wallet not found' }, 404);
    }

    const wallet = walletResult[0];
    const currentBalance = parseFloat(wallet.balance?.toString() || '0');

    if (currentBalance < amount) {
      return json({
        success: false,
        message: `Insufficient balance. You have MWK ${currentBalance.toLocaleString()} but need MWK ${amount.toLocaleString()}.`,
      }, 400);
    }

    const newBalance = currentBalance - amount;

    await db.transaction(async (tx: typeof db) => {
      await tx.update(wallets).set({
        balance: newBalance.toString(),
        updatedAt: new Date(),
      }).where(eq(wallets.id, wallet.id));

      await tx.insert(transactions).values({
        walletId: wallet.id,
        userId: authUser.id,
        transactionType: 'withdrawal',
        amount: amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
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
    });

    return json({
      success: true,
      message: `Withdrawn MWK ${amount.toLocaleString()} to your wallet.`,
      newBalance,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return json({ success: false, message: 'Withdrawal failed' }, 500);
  }
};
