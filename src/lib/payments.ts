/**
 * Shared PayChangu payment verification helpers.
 *
 * Single source of truth for:
 *  - verifying a payment server-side
 *  - creating checkout links
 *
 * Used by the purchase endpoints so all paths behave identically.
 */

import { db } from './db';
import {
  payments,
  users,
  wallets,
  userSessions,
  transactions,
  notifications,
  userContentPurchases,
  contentItems,
} from './db/schema';
import { eq, and } from 'drizzle-orm';
import { generateToken } from './auth';
import { awardInviterRegistrationBonus, awardInviterPurchaseBonus } from './purchases';

// Overridable so staging/tests can point at a mock gateway.
const PAYCHANGU_API = process.env.PAYCHANGU_API_BASE || 'https://api.paychangu.com';
// Never hardcode gateway credentials; they must come from the environment.
const SECRET_KEY = process.env.PAYCHANGU_SECRET_KEY || '';

if (!SECRET_KEY) {
  console.warn('PAYCHANGU_SECRET_KEY not set - payment verification will fail');
}

/** MWK the public pays to join as a member. */
export const SUBSCRIPTION_MWK = 2000;

export interface StartCheckoutOptions {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  paymentType: 'subscription' | 'book';
  amount: number;
  contentId?: string | null;
  origin: string;
}

/**
 * Record a pending payment and create the PayChangu checkout link for it.
 * The payment is only fulfilled later, exactly once, by /api/payments/verify
 * once PayChangu confirms the money arrived.
 */
export async function startCheckout(
  opts: StartCheckoutOptions
): Promise<{ txRef: string; checkoutUrl: string }> {
  // High-entropy, unguessable reference: /api/payments/verify accepts an
  // unauthenticated registration callback based on possession of this value.
  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('');
  const txRef = `${opts.paymentType === 'subscription' ? 'SUB' : 'BOOK'}-${randomHex}`;

  const [row] = await db
    .insert(payments)
    .values({
      userId: opts.userId,
      txRef,
      paymentType: opts.paymentType,
      contentId: opts.contentId ?? null,
      amount: opts.amount.toString(),
      status: 'pending',
    })
    .returning({ id: payments.id });

  try {
    const checkout = await createPayChanguCheckout(
      opts.email,
      opts.amount,
      txRef,
      opts.firstName,
      opts.lastName,
      `${opts.origin}/payment/callback?tx_ref=${txRef}`
    );

    const checkoutUrl = checkout?.data?.checkout_url || checkout?.checkout_url;
    if (!checkoutUrl) {
      throw new Error(`PayChangu returned no checkout URL: ${JSON.stringify(checkout)}`);
    }

    return { txRef, checkoutUrl };
  } catch (error) {
    // Never leave a dangling pending row when we could not even start checkout.
    await db
      .update(payments)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(payments.id, row.id));
    throw error;
  }
}

/**
 * Create a hosted checkout payment link with PayChangu
 * (POST https://api.paychangu.com/payment — see developer.paychangu.com/docs/standard-checkout).
 */
export async function createPayChanguCheckout(
  email: string,
  amount: number,
  txRef: string,
  firstName: string,
  lastName: string,
  callbackUrl: string
) {
  const res = await fetch(`${PAYCHANGU_API}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount,
      currency: 'MWK',
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: callbackUrl,
      // Where PayChangu sends the browser on cancel / repeated failures.
      return_url: callbackUrl,
      customization: {
        title: 'Secondary Yaza',
        description: 'Secondary Yaza payment',
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PayChangu checkout failed: ${error}`);
  }

  return res.json();
}

/**
 * Verify a PayChangu payment.
 */
export async function verifyPayChanguPayment(txRef: string) {
  if (!SECRET_KEY) {
    return {
      verifyData: { status: 'failed', data: { status: 'failed' } },
      confirmedPaid: false,
      stillPending: false,
      explicitlyFailed: true,
      paymentData: null,
    };
  }

  const res = await fetch(`${PAYCHANGU_API}/verify-payment/${txRef}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
  });

  const verifyData = await res.json();

  // The authoritative state lives in data.status: 'success' | 'pending' |
  // 'failed' | 'cancelled'. The top-level status can say "failed" while the
  // transaction is merely not started yet ("Payment transaction not created")
  // — that must NOT be treated as a completed failure.
  const topOk = verifyData.status === 'success' || verifyData.status === 'successful';
  const innerStatus = verifyData.data?.status;
  const confirmedPaid = innerStatus === 'success' || (innerStatus === undefined && topOk);
  const explicitlyFailed =
    innerStatus === 'failed' ||
    innerStatus === 'cancelled' ||
    innerStatus === 'expired' ||
    (innerStatus === undefined &&
      (verifyData.status === 'failed' ||
        verifyData.status === 'cancelled' ||
        verifyData.status === 'expired'));

  return {
    verifyData,
    confirmedPaid,
    stillPending: !confirmedPaid && !explicitlyFailed,
    explicitlyFailed,
    paymentData: verifyData.data || null,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SUBSCRIPTION_DAYS = 30;

export interface PaymentRowLike {
  id: string;
  userId: string | null;
  txRef: string;
  paymentType: string;
  contentId: string | null;
  amount: string | number | null;
}

export interface FulfilResult {
  alreadyProcessed: boolean;
  activated?: boolean;
  token?: string;
  expiresAt?: Date | null;
}

/**
 * Fulfil a payment PayChangu has confirmed as paid — exactly once.
 *
 * A subscription payment belonging to a still-inactive (pending) account
 * ACTIVATES the registration: the account becomes active + subscribed, the
 * wallet is created, the inviter's 500 MWK bonus is credited, and a session
 * token is minted for the new member. Anything else is a renewal or a book
 * purchase for an already-active account.
 */
export async function fulfillPaidPayment(payment: PaymentRowLike): Promise<FulfilResult> {
  let result: FulfilResult = { alreadyProcessed: false, activated: false };

  await db.transaction(async (tx: typeof db) => {
    // Claim the fulfilment: only one caller can flip pending -> paid.
    const claimed = await tx
      .update(payments)
      .set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
      .where(and(eq(payments.id, payment.id), eq(payments.status, 'pending')))
      .returning({ id: payments.id });

    if (claimed.length === 0) {
      result = { alreadyProcessed: true, activated: false };
      return;
    }

    const amountText = parseFloat(String(payment.amount ?? '0')).toLocaleString();
    const now = new Date();

    if (payment.paymentType === 'subscription') {
      if (!payment.userId) return;

      const rows = await tx
        .select()
        .from(users)
        .where(eq(users.id, payment.userId))
        .limit(1);
      if (rows.length === 0) return;

      const account = rows[0];
      const current = account.subscriptionExpiresAt;
      const base = current && current > now ? current : now;
      const expires = new Date(base.getTime() + SUBSCRIPTION_DAYS * DAY_MS);

      if (!account.isActive) {
        // ---- This payment completes a pending registration. ----
        await tx
          .update(users)
          .set({
            isActive: true,
            isSubscribed: true,
            subscriptionExpiresAt: expires,
            updatedAt: now,
          })
          .where(eq(users.id, account.id));

        // The wallet only comes into existence once the money is in.
        const walletRows = await tx
          .select({ id: wallets.id })
          .from(wallets)
          .where(eq(wallets.userId, account.id))
          .limit(1);
        if (walletRows.length === 0) {
          await tx.insert(wallets).values({
            id: crypto.randomUUID(),
            userId: account.id,
            balance: '0',
          });
        }

        await tx.insert(transactions).values({
          userId: account.id,
          transactionType: 'subscription_payment',
          amount: String(payment.amount ?? '0'),
          description: `Member subscription fee of MWK ${amountText} collected via PayChangu`,
          transactionRef: payment.txRef,
        });

        await tx.insert(notifications).values({
          userId: account.id,
          type: 'subscription',
          title: 'Welcome — your account is active',
          message: `Your membership is active until ${expires.toLocaleDateString()}.`,
          link: '/member-access',
          isRead: false,
        });

        // The inviter only earns once the registration actually completes.
        await awardInviterRegistrationBonus(tx, account.referredBy, account.id, account.fullName);

        // First session for the freshly activated account.
        const token = generateToken();
        await tx.insert(userSessions).values({
          id: crypto.randomUUID(),
          userId: account.id,
          token,
          expiresAt: new Date(now.getTime() + SUBSCRIPTION_DAYS * DAY_MS),
        });

        result = { alreadyProcessed: false, activated: true, token, expiresAt: expires };
        return;
      }

      // ---- Existing member renewing. ----
      await tx
        .update(users)
        .set({ isSubscribed: true, subscriptionExpiresAt: expires, updatedAt: now })
        .where(eq(users.id, account.id));

      await tx.insert(transactions).values({
        userId: account.id,
        transactionType: 'subscription_payment',
        amount: String(payment.amount ?? '0'),
        description: `Member subscription renewal of MWK ${amountText} via PayChangu`,
        transactionRef: payment.txRef,
      });

      await tx.insert(notifications).values({
        userId: account.id,
        type: 'subscription',
        title: 'Membership renewed',
        message: `Your membership is now active until ${expires.toLocaleDateString()}.`,
        link: '/member-access',
        isRead: false,
      });

      result = { alreadyProcessed: false, activated: false, expiresAt: expires };
      return;
    }

    // ---- Book purchase. ----
    if (!payment.userId || !payment.contentId) return;

    const content = await tx
      .select({ id: contentItems.id, title: contentItems.title })
      .from(contentItems)
      .where(eq(contentItems.id, payment.contentId))
      .limit(1);
    const title = content[0]?.title || 'a book';

    const owned = await tx
      .select({ id: userContentPurchases.id })
      .from(userContentPurchases)
      .where(and(
        eq(userContentPurchases.userId, payment.userId),
        eq(userContentPurchases.contentId, payment.contentId)
      ))
      .limit(1);

    if (owned.length === 0) {
      await tx.insert(userContentPurchases).values({
        userId: payment.userId,
        contentId: payment.contentId,
        amountPaid: String(payment.amount ?? '0'),
        transactionRef: payment.txRef,
      });

      await tx.insert(transactions).values({
        userId: payment.userId,
        transactionType: 'content_purchase',
        amount: String(payment.amount ?? '0'),
        description: `Book Purchase (PayChangu): ${title}`,
        transactionRef: payment.txRef,
      });

      // 500 MWK to the inviter for every book their invitee buys.
      await awardInviterPurchaseBonus(tx, payment.userId, title);
    }
  });

  return result;
}

/**
 * Check a pending account's earlier checkouts against PayChangu — used when
 * someone retries registration after paying but before the callback ran
 * (browser closed, network dropped, ...). Returns the fresh session token
 * if a payment turns out to have been completed all along.
 */
export async function autoVerifyPendingPayments(
  userId: string
): Promise<{ activated: boolean; token?: string } | null> {
  const pending = await db
    .select()
    .from(payments)
    .where(and(
      eq(payments.userId, userId),
      eq(payments.status, 'pending'),
      eq(payments.paymentType, 'subscription')
    ));

  for (const row of pending) {
    const check = await verifyPayChanguPayment(row.txRef);

    if (check.confirmedPaid) {
      const outcome = await fulfillPaidPayment(row);
      if (!outcome.alreadyProcessed && outcome.activated) {
        return { activated: true, token: outcome.token };
      }
      return { activated: false };
    }

    if (check.explicitlyFailed) {
      await db
        .update(payments)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(and(eq(payments.id, row.id), eq(payments.status, 'pending')));
    }
  }

  return null;
}
