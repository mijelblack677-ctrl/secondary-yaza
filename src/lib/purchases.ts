import { db } from './db';
import { wallets, userContentPurchases, transactions, notifications, referralClaims } from './db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';

export interface PurchaseResult {
  success: boolean;
  message: string;
  newBalance?: number;
  error?: string;
}

/** MWK credited to an inviter for each book their invitee buys. */
const REFERRAL_PURCHASE_MWK = 500;

/** MWK credited to an inviter for each qualifying registrant. */
const REFERRAL_REGISTRATION_MWK = 500;

/**
 * Award the inviter MWK 500 once the person they invited completes
 * registration (i.e. their membership payment is verified).
 * Guarded so an invitee can only ever generate one registration bonus.
 * Safe to call inside a transaction; returns the amount awarded.
 */
export async function awardInviterRegistrationBonus(
  tx: typeof db,
  inviterId: string | null,
  inviteeId: string,
  inviteeName: string
): Promise<number> {
  if (!inviterId || inviterId === inviteeId) return 0;

  const already = await tx
    .select({ id: referralClaims.id })
    .from(referralClaims)
    .where(and(
      eq(referralClaims.inviteeId, inviteeId),
      isNotNull(referralClaims.inviteeRegisteredAt)
    ))
    .limit(1);

  if (already.length > 0) return 0;

  const inviterWallet = await tx
    .select({ id: wallets.id, balance: wallets.balance })
    .from(wallets)
    .where(eq(wallets.userId, inviterId))
    .limit(1);

  if (inviterWallet.length === 0) return 0;

  await tx.insert(referralClaims).values({
    inviterId,
    inviteeId,
    inviteeRegisteredAt: new Date(),
    amount: REFERRAL_REGISTRATION_MWK.toString(),
    description: `Referral registration bonus MWK ${REFERRAL_REGISTRATION_MWK.toLocaleString()} for inviting ${inviteeName}`,
  });

  const newInviterBalance = (
    parseFloat(inviterWallet[0].balance || '0') + REFERRAL_REGISTRATION_MWK
  ).toString();

  await tx.update(wallets).set({
    balance: newInviterBalance,
    updatedAt: new Date(),
  }).where(eq(wallets.id, inviterWallet[0].id));

  await tx.insert(notifications).values({
    userId: inviterId,
    type: 'referral_bonus',
    title: 'Referral bonus received',
    message: `You earned MWK ${REFERRAL_REGISTRATION_MWK.toLocaleString()} for inviting ${inviteeName}.`,
    link: '/member-access',
    isRead: false,
  });

  return REFERRAL_REGISTRATION_MWK;
}

/**
 * Award the inviter MWK 500 for a book their invitee just bought.
 * Every book earns the inviter a fresh 500 — unlimited books, unlimited
 * bonuses — so this inserts a brand-new referral claim row each time
 * (registration bonuses live in their own row and never collide).
 *
 * Safe to call inside a transaction; returns the amount awarded.
 */
export async function awardInviterPurchaseBonus(
  tx: typeof db,
  buyerId: string,
  contentTitle: string
): Promise<number> {
  // Find who invited this buyer (their registration claim row).
  const referred = await tx
    .select({ id: referralClaims.id, inviterId: referralClaims.inviterId })
    .from(referralClaims)
    .where(and(
      eq(referralClaims.inviteeId, buyerId),
      isNotNull(referralClaims.inviteeRegisteredAt)
    ))
    .limit(1);

  if (referred.length === 0 || !referred[0].inviterId || referred[0].inviterId === buyerId) {
    return 0;
  }

  const inviterId = referred[0].inviterId;

  const inviterWallet = await tx
    .select({ id: wallets.id, balance: wallets.balance })
    .from(wallets)
    .where(eq(wallets.userId, inviterId))
    .limit(1);

  if (inviterWallet.length === 0) {
    return 0;
  }

  // One claim row per book purchase — this is the "500 per book, unlimited" rule.
  await tx.insert(referralClaims).values({
    inviterId,
    inviteeId: buyerId,
    purchasedAt: new Date(),
    amount: REFERRAL_PURCHASE_MWK.toString(),
    description: `Referral book bonus MWK ${REFERRAL_PURCHASE_MWK.toLocaleString()} for "${contentTitle.slice(0, 80)}"`,
  });

  const newInviterBalance = (
    parseFloat(inviterWallet[0].balance || '0') + REFERRAL_PURCHASE_MWK
  ).toString();

  await tx.update(wallets).set({
    balance: newInviterBalance,
    updatedAt: new Date(),
  }).where(eq(wallets.id, inviterWallet[0].id));

  await tx.insert(notifications).values({
    userId: inviterId,
    type: 'referral_bonus',
    title: 'Referral bonus received',
    message: `Your invitee bought "${contentTitle.slice(0, 60)}" — you earned MWK ${REFERRAL_PURCHASE_MWK.toLocaleString()}.`,
    link: '/member-access',
    isRead: false,
  });

  return REFERRAL_PURCHASE_MWK;
}

/**
 * Process a content purchase paid from the member's wallet.
 * Deducts from wallet, records purchase and transaction, and awards the
 * inviter MWK 500 if the buyer was referred by another user.
 */
export async function processContentPurchase(
  userId: string,
  contentId: string,
  price: number,
  contentTitle: string
): Promise<PurchaseResult> {
  try {
    // Debit the wallet with a single conditional UPDATE: the balance check and
    // the subtraction happen together, so two concurrent purchases can never
    // both pass a stale check and take the wallet below zero.
    const outcome = await db.transaction(async (tx: typeof db) => {
      const debited = await tx.execute(sql`
        UPDATE wallets
        SET balance = balance - ${price}, updated_at = now()
        WHERE user_id = ${userId} AND balance >= ${price}
        RETURNING id, balance + ${price} AS balance_before, balance AS balance_after
      `);

      const rows = normalizeRows(debited);
      if (rows.length === 0) return { ok: false as const };

      const row = rows[0];

      // Record the purchase. The unique (user_id, content_id) constraint makes a
      // duplicate purchase fail here and roll the whole debit back.
      await tx
        .insert(userContentPurchases)
        .values({
          userId,
          contentId,
          amountPaid: price.toString(),
        });

      // Record transaction
      await tx
        .insert(transactions)
        .values({
          walletId: String(row.id),
          userId,
          transactionType: 'content_purchase',
          amount: price.toString(),
          balanceBefore: String(row.balance_before),
          balanceAfter: String(row.balance_after),
          description: `Book Purchase: ${contentTitle}`,
        });

      // Award the inviter when the buyer was referred (500 per book).
      await awardInviterPurchaseBonus(tx, userId, contentTitle);

      return { ok: true as const, newBalance: Number(row.balance_after) };
    });

    if (!outcome.ok) {
      const walletResult = await db
        .select({ balance: wallets.balance })
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);

      if (walletResult.length === 0) {
        return {
          success: false,
          message: 'Wallet not found',
          error: 'WALLET_NOT_FOUND',
        };
      }

      const currentBalance = parseFloat(walletResult[0].balance?.toString() || '0');
      return {
        success: false,
        message: `Insufficient balance. You need MWK ${price.toLocaleString()} but have MWK ${currentBalance.toLocaleString()}`,
        error: 'INSUFFICIENT_BALANCE',
      };
    }

    return {
      success: true,
      message: `Book purchased! MWK ${price.toLocaleString()} deducted.`,
      newBalance: outcome.newBalance,
    };
  } catch (error) {
    console.error('Purchase error:', error);
    return {
      success: false,
      message: 'Failed to process purchase',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** postgres-js returns a row list; normalise it to a plain array. */
function normalizeRows(result: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(result)) return result as Array<Record<string, unknown>>;
  const maybe = result as { rows?: Array<Record<string, unknown>> } | null;
  return maybe?.rows ?? [];
}

/** Check if user owns a content item. */
export async function userOwnsContent(userId: string, contentId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(userContentPurchases)
    .where(eq(userContentPurchases.userId, userId));

  return result.some(p => p.contentId === contentId);
}

/** Get user's purchased content IDs. */
export async function getUserPurchasedContentIds(userId: string): Promise<string[]> {
  const result = await db
    .select({ contentId: userContentPurchases.contentId })
    .from(userContentPurchases)
    .where(eq(userContentPurchases.userId, userId));

  return result.map(r => r.contentId);
}
