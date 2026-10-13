export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { users, notifications } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';
import { verifyPassword } from '@lib/password';
import { clientIp, rateLimit, tooManyRequests } from '@lib/rateLimit';
import { normalizeMalawiPhone, resolveOperator } from '@lib/payouts';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/auth/payout-phone
 *
 * Where a member's withdrawals land. Changing where money goes is the single
 * most valuable thing a stolen session could do, so the change requires the
 * account password again — a session alone is not enough.
 *
 * Body: { phone: '0991234567', password: '...' }  or  { reset: true, password: '...' }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return json({ success: false, message: 'Authentication required' }, 401);
    }

    const limit = rateLimit(`payout-phone:${authUser.id}:${clientIp(request)}`, 10, 10 * 60 * 1000);
    if (!limit.allowed) {
      return tooManyRequests(limit.retryAfterSeconds);
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const password = String(body?.password ?? '');
    if (!password) {
      return json({ success: false, message: 'Enter your password to change your payout number.' }, 400);
    }

    const rows = await db
      .select({ id: users.id, phone: users.phone, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (rows.length === 0) {
      return json({ success: false, message: 'Account not found' }, 404);
    }
    const account = rows[0];

    if (!(await verifyPassword(password, account.passwordHash))) {
      return json({ success: false, message: 'That password is not correct.' }, 401);
    }

    // No number supplied, or an explicit reset: fall back to the account number.
    const wantsReset = body?.reset === true || body?.phone === undefined || body?.phone === null || String(body.phone).trim() === '';
    if (wantsReset) {
      await db
        .update(users)
        .set({ payoutPhone: null, updatedAt: new Date() })
        .where(eq(users.id, authUser.id));

      const normalized = normalizeMalawiPhone(account.phone);
      const operator = normalized ? await resolveOperator(normalized) : null;

      return json({
        success: true,
        message: `Payouts will now go to the number on your account (${account.phone}).`,
        payoutPhone: null,
        effectivePhone: normalized ?? account.phone,
        operator: operator?.name ?? null,
      });
    }

    const normalized = normalizeMalawiPhone(body.phone);
    if (!normalized) {
      return json(
        {
          success: false,
          message: 'Enter a valid Malawian mobile number, e.g. 0991234567 or +265991234567.',
        },
        400
      );
    }

    const operator = await resolveOperator(normalized);
    if (!operator) {
      return json(
        { success: false, message: 'That number is not an Airtel Money or TNM Mpamba number.' },
        400
      );
    }

    if (normalized === normalizeMalawiPhone(account.phone)) {
      // Same as the account number — a stored override would be redundant.
      await db
        .update(users)
        .set({ payoutPhone: null, updatedAt: new Date() })
        .where(eq(users.id, authUser.id));

      return json({
        success: true,
        message: 'Payouts go to the number on your account.',
        payoutPhone: null,
        effectivePhone: normalized,
        operator: operator.name,
      });
    }

    await db
      .update(users)
      .set({ payoutPhone: normalized, updatedAt: new Date() })
      .where(eq(users.id, authUser.id));

    await db.insert(notifications).values({
      userId: authUser.id,
      type: 'withdrawal',
      title: 'Payout number updated',
      message: `Your withdrawals will now be sent to ${operator.name} ${normalized}.`,
      link: '/member-access',
      isRead: false,
    });

    return json({
      success: true,
      message: `Payouts will now be sent to ${operator.name} ${normalized}.`,
      payoutPhone: normalized,
      effectivePhone: normalized,
      operator: operator.name,
    });
  } catch (error) {
    console.error('Payout phone error:', error);
    return json({ success: false, message: 'Could not update your payout number' }, 500);
  }
};
