import { r as referralClaims, w as wallets, n as notifications, d as db, g as userContentPurchases, t as transactions } from './index_Bl8uyV_y.mjs';
import { and, eq, isNotNull } from 'drizzle-orm';

const REFERRAL_PURCHASE_MWK = 500;
const REFERRAL_REGISTRATION_MWK = 500;
async function awardInviterRegistrationBonus(tx, inviterId, inviteeId, inviteeName) {
  if (!inviterId || inviterId === inviteeId) return 0;
  const already = await tx.select({ id: referralClaims.id }).from(referralClaims).where(and(
    eq(referralClaims.inviteeId, inviteeId),
    isNotNull(referralClaims.inviteeRegisteredAt)
  )).limit(1);
  if (already.length > 0) return 0;
  const inviterWallet = await tx.select({ id: wallets.id, balance: wallets.balance }).from(wallets).where(eq(wallets.userId, inviterId)).limit(1);
  if (inviterWallet.length === 0) return 0;
  await tx.insert(referralClaims).values({
    inviterId,
    inviteeId,
    inviteeRegisteredAt: /* @__PURE__ */ new Date(),
    amount: REFERRAL_REGISTRATION_MWK.toString(),
    description: `Referral registration bonus MWK ${REFERRAL_REGISTRATION_MWK.toLocaleString()} for inviting ${inviteeName}`
  });
  const newInviterBalance = (parseFloat(inviterWallet[0].balance || "0") + REFERRAL_REGISTRATION_MWK).toString();
  await tx.update(wallets).set({
    balance: newInviterBalance,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(wallets.id, inviterWallet[0].id));
  await tx.insert(notifications).values({
    userId: inviterId,
    type: "referral_bonus",
    title: "Referral bonus received",
    message: `You earned MWK ${REFERRAL_REGISTRATION_MWK.toLocaleString()} for inviting ${inviteeName}.`,
    link: "/member-access",
    isRead: false
  });
  return REFERRAL_REGISTRATION_MWK;
}
async function awardInviterPurchaseBonus(tx, buyerId, contentTitle) {
  const referred = await tx.select({ id: referralClaims.id, inviterId: referralClaims.inviterId }).from(referralClaims).where(and(
    eq(referralClaims.inviteeId, buyerId),
    isNotNull(referralClaims.inviteeRegisteredAt)
  )).limit(1);
  if (referred.length === 0 || !referred[0].inviterId || referred[0].inviterId === buyerId) {
    return 0;
  }
  const inviterId = referred[0].inviterId;
  const inviterWallet = await tx.select({ id: wallets.id, balance: wallets.balance }).from(wallets).where(eq(wallets.userId, inviterId)).limit(1);
  if (inviterWallet.length === 0) {
    return 0;
  }
  await tx.insert(referralClaims).values({
    inviterId,
    inviteeId: buyerId,
    purchasedAt: /* @__PURE__ */ new Date(),
    amount: REFERRAL_PURCHASE_MWK.toString(),
    description: `Referral book bonus MWK ${REFERRAL_PURCHASE_MWK.toLocaleString()} for "${contentTitle.slice(0, 80)}"`
  });
  const newInviterBalance = (parseFloat(inviterWallet[0].balance || "0") + REFERRAL_PURCHASE_MWK).toString();
  await tx.update(wallets).set({
    balance: newInviterBalance,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(wallets.id, inviterWallet[0].id));
  await tx.insert(notifications).values({
    userId: inviterId,
    type: "referral_bonus",
    title: "Referral bonus received",
    message: `Your invitee bought "${contentTitle.slice(0, 60)}" — you earned MWK ${REFERRAL_PURCHASE_MWK.toLocaleString()}.`,
    link: "/member-access",
    isRead: false
  });
  return REFERRAL_PURCHASE_MWK;
}
async function processContentPurchase(userId, contentId, price, contentTitle) {
  try {
    const walletResult = await db.select().from(wallets).where(eq(wallets.userId, userId));
    if (walletResult.length === 0) {
      return {
        success: false,
        message: "Wallet not found",
        error: "WALLET_NOT_FOUND"
      };
    }
    const wallet = walletResult[0];
    const currentBalance = parseFloat(wallet.balance?.toString() || "0");
    if (currentBalance < price) {
      return {
        success: false,
        message: `Insufficient balance. You need MWK ${price.toLocaleString()} but have MWK ${currentBalance.toLocaleString()}`,
        error: "INSUFFICIENT_BALANCE"
      };
    }
    const newBalance = currentBalance - price;
    await db.transaction(async (tx) => {
      await tx.update(wallets).set({
        balance: newBalance.toString(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(wallets.id, wallet.id));
      await tx.insert(userContentPurchases).values({
        userId,
        contentId,
        amountPaid: price.toString()
      });
      await tx.insert(transactions).values({
        walletId: wallet.id,
        userId,
        transactionType: "content_purchase",
        amount: price.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        description: `Book Purchase: ${contentTitle}`
      });
      await awardInviterPurchaseBonus(tx, userId, contentTitle);
    });
    return {
      success: true,
      message: `Book purchased! MWK ${price.toLocaleString()} deducted.`,
      newBalance
    };
  } catch (error) {
    console.error("Purchase error:", error);
    return {
      success: false,
      message: "Failed to process purchase",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function userOwnsContent(userId, contentId) {
  const result = await db.select().from(userContentPurchases).where(eq(userContentPurchases.userId, userId));
  return result.some((p) => p.contentId === contentId);
}
async function getUserPurchasedContentIds(userId) {
  const result = await db.select({ contentId: userContentPurchases.contentId }).from(userContentPurchases).where(eq(userContentPurchases.userId, userId));
  return result.map((r) => r.contentId);
}

export { awardInviterPurchaseBonus, awardInviterRegistrationBonus, getUserPurchasedContentIds, processContentPurchase, userOwnsContent };
