export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { payments, users } from '@lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser, getUserFromSession } from '@lib/auth';
import { verifyPayChanguPayment, fulfillPaidPayment } from '@lib/payments';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Accept Bearer header or the plain `token` cookie (the callback page relies on the cookie). */
async function resolveUser(request: Request) {
  const direct = await getAuthUser(request);
  if (direct) return direct;

  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  if (match) return getUserFromSession(match[1]);
  return null;
}

/**
 * GET /api/payments/verify?tx_ref=...
 *
 * Asks PayChangu whether the money actually arrived, then fulfils the
 * payment exactly once. A verified subscription payment for a still-pending
 * account ACTIVATES the registration and returns a session token — this is
 * the only path reachable without a session, and it is gated by the
 * unguessable tx_ref handed to that browser at registration.
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const txRef = url.searchParams.get('tx_ref') || url.searchParams.get('txRef');
    if (!txRef) {
      return json({ success: false, message: 'Missing tx_ref' }, 400);
    }

    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.txRef, txRef))
      .limit(1);

    if (rows.length === 0) {
      return json({ success: false, message: 'Payment not found' }, 404);
    }

    const payment = rows[0];
    const user = await resolveUser(request);

    let mayProceed = false;
    if (user && (payment.userId === user.id || user.isAdmin)) {
      mayProceed = true;
    } else if (!user && payment.paymentType === 'subscription' && payment.userId) {
      // Registration callback: no session exists yet. The unguessable tx_ref
      // is the capability; only allow it for an account that is still pending.
      const account = await db
        .select({ id: users.id, isActive: users.isActive })
        .from(users)
        .where(eq(users.id, payment.userId))
        .limit(1);
      mayProceed = account.length > 0 && account[0].isActive === false;
    }

    if (!mayProceed) {
      return json({ success: false, message: 'Payment not found' }, 404);
    }

    // Already fulfilled on an earlier verify call — stay idempotent.
    if (payment.status === 'paid') {
      return json({
        success: true,
        status: 'paid',
        paymentType: payment.paymentType,
        contentId: payment.contentId,
        amount: payment.amount,
      });
    }

    const result = await verifyPayChanguPayment(txRef);

    if (result.confirmedPaid) {
      const outcome = await fulfillPaidPayment(payment);

      if (outcome.alreadyProcessed) {
        return json({
          success: true,
          status: 'paid',
          paymentType: payment.paymentType,
          contentId: payment.contentId,
          amount: payment.amount,
        });
      }

      return json({
        success: true,
        status: 'paid',
        paymentType: payment.paymentType,
        contentId: payment.contentId,
        amount: payment.amount,
        activated: Boolean(outcome.activated),
        // Present only when this payment completed a registration.
        token: outcome.token,
        redirectTo: outcome.activated ? '/library' : null,
      });
    }

    if (result.explicitlyFailed) {
      await db
        .update(payments)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(and(eq(payments.id, payment.id), eq(payments.status, 'pending')));

      return json({
        success: false,
        status: 'failed',
        paymentType: payment.paymentType,
        message:
          payment.paymentType === 'subscription' && !user
            ? 'The payment was not completed, so no account was created. Please try again.'
            : 'The payment was not completed. You can try again.',
      });
    }

    // Not confirmed, not failed — still processing at PayChangu.
    return json({
      success: false,
      status: 'pending',
      paymentType: payment.paymentType,
      message: 'Payment is still processing. Please try again in a moment.',
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    return json({ success: false, message: 'Verification failed. Please try again.' }, 500);
  }
};
