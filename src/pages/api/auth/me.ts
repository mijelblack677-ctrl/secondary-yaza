export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { users, wallets, referralClaims } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        payoutPhone: users.payoutPhone,
        referralCode: users.referralCode,
        isAdmin: users.isAdmin,
        isActive: users.isActive,
        isSubscribed: users.isSubscribed,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        policiesAcceptedAt: users.policiesAcceptedAt,
        walletBalance: wallets.balance,
      })
      .from(users)
      .leftJoin(wallets, eq(wallets.userId, users.id))
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (user.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = user[0];

    // Count how many referrals this user has earned (as inviter).
    const referralRows = await db
      .select({ amount: referralClaims.amount })
      .from(referralClaims)
      .where(eq(referralClaims.inviterId, authUser.id));

    const referralCount = referralRows.reduce(
      (sum, r) => sum + (parseInt(r.amount || '0', 10) || 0),
      0
    );

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: row.id,
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          payoutPhone: row.payoutPhone,
          referralCode: row.referralCode,
          isAdmin: row.isAdmin,
          isActive: row.isActive,
          isSubscribed: row.isSubscribed,
          subscriptionExpiresAt: row.subscriptionExpiresAt,
          policiesAcceptedAt: row.policiesAcceptedAt,
          walletBalance: row.walletBalance ?? '0',
          referralCount,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auth/me error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to load account' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
