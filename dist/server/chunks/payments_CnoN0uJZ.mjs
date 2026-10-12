import { d as db, p as payments, u as users, w as wallets, t as transactions, n as notifications, f as userSessions, c as contentItems, g as userContentPurchases } from './index_Bl8uyV_y.mjs';
import { and, eq } from 'drizzle-orm';
import { generateToken } from './auth_CImtR7oD.mjs';
import { awardInviterRegistrationBonus, awardInviterPurchaseBonus } from './purchases_XM3M2JdL.mjs';

const PAYCHANGU_API = process.env.PAYCHANGU_API_BASE || "https://api.paychangu.com";
const SECRET_KEY = process.env.PAYCHANGU_SECRET_KEY || "";
if (!SECRET_KEY) {
  console.warn("PAYCHANGU_SECRET_KEY not set - payment verification will fail");
}
const SUBSCRIPTION_MWK = 2e3;
async function startCheckout(opts) {
  const randomHex = Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
    (b) => b.toString(16).padStart(2, "0")
  ).join("");
  const txRef = `${opts.paymentType === "subscription" ? "SUB" : "BOOK"}-${randomHex}`;
  const [row] = await db.insert(payments).values({
    userId: opts.userId,
    txRef,
    paymentType: opts.paymentType,
    contentId: opts.contentId ?? null,
    amount: opts.amount.toString(),
    status: "pending"
  }).returning({ id: payments.id });
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
    await db.update(payments).set({ status: "failed", updatedAt: /* @__PURE__ */ new Date() }).where(eq(payments.id, row.id));
    throw error;
  }
}
async function createPayChanguCheckout(email, amount, txRef, firstName, lastName, callbackUrl) {
  const res = await fetch(`${PAYCHANGU_API}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${SECRET_KEY}`
    },
    body: JSON.stringify({
      amount,
      currency: "MWK",
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: callbackUrl,
      // Where PayChangu sends the browser on cancel / repeated failures.
      return_url: callbackUrl,
      customization: {
        title: "Secondary Yaza",
        description: "Secondary Yaza payment"
      }
    })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PayChangu checkout failed: ${error}`);
  }
  return res.json();
}
async function verifyPayChanguPayment(txRef) {
  if (!SECRET_KEY) {
    return {
      verifyData: { status: "failed", data: { status: "failed" } },
      confirmedPaid: false,
      stillPending: false,
      explicitlyFailed: true,
      paymentData: null
    };
  }
  const res = await fetch(`${PAYCHANGU_API}/verify-payment/${txRef}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${SECRET_KEY}`
    }
  });
  const verifyData = await res.json();
  const topOk = verifyData.status === "success" || verifyData.status === "successful";
  const innerStatus = verifyData.data?.status;
  const confirmedPaid = innerStatus === "success" || innerStatus === void 0 && topOk;
  const explicitlyFailed = innerStatus === "failed" || innerStatus === "cancelled" || innerStatus === "expired" || innerStatus === void 0 && (verifyData.status === "failed" || verifyData.status === "cancelled" || verifyData.status === "expired");
  return {
    verifyData,
    confirmedPaid,
    stillPending: !confirmedPaid && !explicitlyFailed,
    explicitlyFailed,
    paymentData: verifyData.data || null
  };
}
const DAY_MS = 24 * 60 * 60 * 1e3;
const SUBSCRIPTION_DAYS = 30;
async function fulfillPaidPayment(payment) {
  let result = { alreadyProcessed: false, activated: false };
  await db.transaction(async (tx) => {
    const claimed = await tx.update(payments).set({ status: "paid", paidAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(payments.id, payment.id), eq(payments.status, "pending"))).returning({ id: payments.id });
    if (claimed.length === 0) {
      result = { alreadyProcessed: true, activated: false };
      return;
    }
    const amountText = parseFloat(String(payment.amount ?? "0")).toLocaleString();
    const now = /* @__PURE__ */ new Date();
    if (payment.paymentType === "subscription") {
      if (!payment.userId) return;
      const rows = await tx.select().from(users).where(eq(users.id, payment.userId)).limit(1);
      if (rows.length === 0) return;
      const account = rows[0];
      const current = account.subscriptionExpiresAt;
      const base = current && current > now ? current : now;
      const expires = new Date(base.getTime() + SUBSCRIPTION_DAYS * DAY_MS);
      if (!account.isActive) {
        await tx.update(users).set({
          isActive: true,
          isSubscribed: true,
          subscriptionExpiresAt: expires,
          updatedAt: now
        }).where(eq(users.id, account.id));
        const walletRows = await tx.select({ id: wallets.id }).from(wallets).where(eq(wallets.userId, account.id)).limit(1);
        if (walletRows.length === 0) {
          await tx.insert(wallets).values({
            id: crypto.randomUUID(),
            userId: account.id,
            balance: "0"
          });
        }
        await tx.insert(transactions).values({
          userId: account.id,
          transactionType: "subscription_payment",
          amount: String(payment.amount ?? "0"),
          description: `Member subscription fee of MWK ${amountText} collected via PayChangu`,
          transactionRef: payment.txRef
        });
        await tx.insert(notifications).values({
          userId: account.id,
          type: "subscription",
          title: "Welcome — your account is active",
          message: `Your membership is active until ${expires.toLocaleDateString()}.`,
          link: "/member-access",
          isRead: false
        });
        await awardInviterRegistrationBonus(tx, account.referredBy, account.id, account.fullName);
        const token = generateToken();
        await tx.insert(userSessions).values({
          id: crypto.randomUUID(),
          userId: account.id,
          token,
          expiresAt: new Date(now.getTime() + SUBSCRIPTION_DAYS * DAY_MS)
        });
        result = { alreadyProcessed: false, activated: true, token, expiresAt: expires };
        return;
      }
      await tx.update(users).set({ isSubscribed: true, subscriptionExpiresAt: expires, updatedAt: now }).where(eq(users.id, account.id));
      await tx.insert(transactions).values({
        userId: account.id,
        transactionType: "subscription_payment",
        amount: String(payment.amount ?? "0"),
        description: `Member subscription renewal of MWK ${amountText} via PayChangu`,
        transactionRef: payment.txRef
      });
      await tx.insert(notifications).values({
        userId: account.id,
        type: "subscription",
        title: "Membership renewed",
        message: `Your membership is now active until ${expires.toLocaleDateString()}.`,
        link: "/member-access",
        isRead: false
      });
      result = { alreadyProcessed: false, activated: false, expiresAt: expires };
      return;
    }
    if (!payment.userId || !payment.contentId) return;
    const content = await tx.select({ id: contentItems.id, title: contentItems.title }).from(contentItems).where(eq(contentItems.id, payment.contentId)).limit(1);
    const title = content[0]?.title || "a book";
    const owned = await tx.select({ id: userContentPurchases.id }).from(userContentPurchases).where(and(
      eq(userContentPurchases.userId, payment.userId),
      eq(userContentPurchases.contentId, payment.contentId)
    )).limit(1);
    if (owned.length === 0) {
      await tx.insert(userContentPurchases).values({
        userId: payment.userId,
        contentId: payment.contentId,
        amountPaid: String(payment.amount ?? "0"),
        transactionRef: payment.txRef
      });
      await tx.insert(transactions).values({
        userId: payment.userId,
        transactionType: "content_purchase",
        amount: String(payment.amount ?? "0"),
        description: `Book Purchase (PayChangu): ${title}`,
        transactionRef: payment.txRef
      });
      await awardInviterPurchaseBonus(tx, payment.userId, title);
    }
  });
  return result;
}
async function autoVerifyPendingPayments(userId) {
  const pending = await db.select().from(payments).where(and(
    eq(payments.userId, userId),
    eq(payments.status, "pending"),
    eq(payments.paymentType, "subscription")
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
      await db.update(payments).set({ status: "failed", updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(payments.id, row.id), eq(payments.status, "pending")));
    }
  }
  return null;
}

export { SUBSCRIPTION_MWK as S, autoVerifyPendingPayments as a, fulfillPaidPayment as f, startCheckout as s, verifyPayChanguPayment as v };
