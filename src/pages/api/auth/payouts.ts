export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { users, payouts } from '@lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';
import {
  WITHDRAWAL_FEE_RATE,
  MIN_WITHDRAWAL_MWK,
  WITHDRAWAL_STEP_MWK,
  normalizeMalawiPhone,
  resolveOperator,
  reconcilePendingPayouts,
} from '@lib/payouts';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * GET /api/auth/payouts
 *
 * The member's withdrawal history. Payouts settle asynchronously at the
 * gateway, so before answering we re-check anything still in flight — that is
 * what turns a stuck 'pending' row into either 'success' or a refund.
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return json({ success: false, message: 'Authentication required' }, 401);
    }

    // Best-effort: a gateway outage must not break the member's page.
    try {
      await reconcilePendingPayouts(authUser.id);
    } catch (error) {
      console.warn('Payout reconciliation skipped:', error);
    }

    const rows = await db
      .select({
        chargeId: payouts.chargeId,
        grossAmount: payouts.grossAmount,
        feeAmount: payouts.feeAmount,
        netAmount: payouts.netAmount,
        phone: payouts.phone,
        operatorName: payouts.operatorName,
        status: payouts.status,
        failureReason: payouts.failureReason,
        createdAt: payouts.createdAt,
        completedAt: payouts.completedAt,
      })
      .from(payouts)
      .where(eq(payouts.userId, authUser.id))
      .orderBy(desc(payouts.createdAt))
      .limit(20);

    const account = await db
      .select({ phone: users.phone, payoutPhone: users.payoutPhone })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    const payoutPhone = account[0]?.payoutPhone ?? null;
    const effectivePhone = payoutPhone || account[0]?.phone || null;
    const normalized = effectivePhone ? normalizeMalawiPhone(effectivePhone) : null;
    const operator = normalized ? await resolveOperator(normalized) : null;

    return json({
      success: true,
      feeRate: WITHDRAWAL_FEE_RATE,
      feePercent: Math.round(WITHDRAWAL_FEE_RATE * 100),
      minWithdrawal: MIN_WITHDRAWAL_MWK,
      step: WITHDRAWAL_STEP_MWK,
      payoutPhone,
      effectivePhone: normalized ?? effectivePhone,
      operator: operator?.name ?? null,
      payouts: rows,
    });
  } catch (error) {
    console.error('Payouts list error:', error);
    return json({ success: false, message: 'Could not load your withdrawals' }, 500);
  }
};
