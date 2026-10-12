export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { users } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, generateReferralCode, validatePasswordStrength } from '@lib/password';
import { buildSessionCookie } from '@lib/auth';
import { startCheckout, autoVerifyPendingPayments, SUBSCRIPTION_MWK } from '@lib/payments';
import { rateLimit, clientIp, tooManyRequests } from '@lib/rateLimit';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/auth/register
 *
 * Registration is completed BY PAYMENT. This endpoint only stages a pending
 * (inactive) account and hands back a PayChangu checkout link for the MWK
 * 2,000 membership fee. The account — wallet, referral bonuses, session —
 * springs into existence only once /api/payments/verify confirms the money
 * arrived. If the payment never happens, nothing happens.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Registration creates a PayChangu checkout each time, so cap the rate.
    const ipLimit = rateLimit(`register:ip:${clientIp(request)}`, 20, 60 * 60 * 1000);
    if (!ipLimit.allowed) return tooManyRequests(ipLimit.retryAfterSeconds);

    const body = await request.json();
    const { fullName, email, phone, password, policiesAcceptedAt, referralCode } = body;

    // The registration gate. An account may never be created without the user
    // having accepted the Terms of Service and Privacy Policy.
    if (!policiesAcceptedAt || typeof policiesAcceptedAt !== 'string') {
      return json({
        success: false,
        message: 'You must accept the Terms of Service and Privacy Policy before creating an account.',
      }, 400);
    }

    if (!fullName || !email || !phone || !password) {
      return json({
        success: false,
        message: 'Full name, email, phone, and password are required',
      }, 400);
    }

    // Reject trivially weak passwords server-side (never trust the client form).
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return json({ success: false, message: passwordError }, 400);
    }

    const emailLower = email.toLowerCase();
    const enteredReferralCode = typeof referralCode === 'string' ? referralCode.trim() : '';

    // Resolve the inviter, if a referral code was given.
    let referredBy: string | null = null;
    if (enteredReferralCode) {
      const inviter = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, enteredReferralCode))
        .limit(1);
      if (inviter.length > 0) {
        referredBy = inviter[0].id;
      }
    }

    const origin = new URL(request.url).origin;
    const nameParts = String(fullName).trim().split(/\s+/);
    const checkoutArgs = {
      email: emailLower,
      firstName: nameParts[0] || 'Member',
      lastName: nameParts.slice(1).join(' ') || 'Member',
      paymentType: 'subscription' as const,
      amount: SUBSCRIPTION_MWK,
      origin,
    };

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    let accountId: string;

    if (existing.length > 0) {
      const account = existing[0];

      // A completed account is simply already registered.
      if (account.isActive) {
        return json(
          { success: false, message: 'Email already registered — please sign in instead.' },
          409
        );
      }

      // Pending account (registered, never paid): before charging them again,
      // see whether their earlier checkout actually went through but the
      // callback never ran.
      const revived = await autoVerifyPendingPayments(account.id);
      if (revived?.activated && revived.token) {
        // HttpOnly session cookie — the token is never exposed to page JS.
        return new Response(
          JSON.stringify({
            success: true,
            activated: true,
            message: 'Your payment was already completed — welcome!',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': buildSessionCookie(revived.token, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            },
          }
        );
      }

      const phoneOwner = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);
      if (phoneOwner.length > 0 && phoneOwner[0].id !== account.id) {
        return json({ success: false, message: 'Phone number already registered' }, 409);
      }

      // Refresh their details and referral for the new attempt.
      await db
        .update(users)
        .set({
          fullName,
          phone,
          passwordHash: await hashPassword(password),
          referredBy,
          updatedAt: new Date(),
        })
        .where(eq(users.id, account.id));

      accountId = account.id;
    } else {
      const existingPhone = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);
      if (existingPhone.length > 0) {
        return json({ success: false, message: 'Phone number already registered' }, 409);
      }

      accountId = crypto.randomUUID();
      await db.insert(users).values({
        id: accountId,
        fullName,
        email: emailLower,
        phone,
        passwordHash: await hashPassword(password),
        referralCode: generateReferralCode(),
        referredBy,
        isAdmin: false,
        // Pending until PayChangu confirms the MWK 2,000 membership fee.
        isActive: false,
        isSubscribed: false,
        policiesAcceptedAt: new Date(policiesAcceptedAt),
      });
    }

    // Create the membership checkout. Nothing else happens until it is paid.
    let checkout: { txRef: string; checkoutUrl: string };
    try {
      checkout = await startCheckout({ userId: accountId, ...checkoutArgs });
    } catch (paymentError) {
      console.error('Checkout creation failed during registration:', paymentError);
      return json(
        {
          success: false,
          message:
            'Your registration is incomplete because the payment could not be started. Please try again — no account is active until the membership fee is paid.',
        },
        502
      );
    }

    return json({
      success: true,
      requiresPayment: true,
      message: `Complete your MWK ${SUBSCRIPTION_MWK.toLocaleString()} membership payment to activate your account.`,
      checkoutUrl: checkout.checkoutUrl,
      txRef: checkout.txRef,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ success: false, message: 'Registration failed' }, 500);
  }
};
