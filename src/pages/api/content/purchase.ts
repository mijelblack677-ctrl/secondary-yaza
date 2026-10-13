export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { contentItems, userContentPurchases, users } from '@lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';
import { processContentPurchase } from '@lib/purchases';
import { startCheckout } from '@lib/payments';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/content/purchase { contentId }
 * Pays from the member's wallet when it covers the price; otherwise starts a
 * PayChangu checkout for the book and returns { requiresPayment, checkoutUrl }.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);

    // Buying is a member action like reading — the library only ever offers
    // the button to members, so the endpoint holds the same line and answers
    // with the same codes the pages turn into a prompt.
    if (!authUser) {
      return json({
        success: false,
        code: 'login_required',
        message: 'Sign in to buy this title.',
        redirect: '/login?redirect=/library',
      }, 401);
    }

    if (!authUser.isSubscribed || !authUser.subscriptionExpiresAt) {
      return json({
        success: false,
        code: 'subscription_required',
        message: 'Membership required to buy titles from the collection.',
        redirect: '/member-access',
      }, 403);
    }

    if (authUser.subscriptionExpiresAt < new Date()) {
      return json({
        success: false,
        code: 'subscription_expired',
        message: 'Your membership has expired. Renew it to keep buying titles.',
        redirect: '/member-access',
      }, 403);
    }

    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return json({ success: false, message: 'Content ID is required' }, 400);
    }

    // Check if content exists and is premium
    const content = await db
      .select()
      .from(contentItems)
      .where(and(eq(contentItems.id, contentId), eq(contentItems.isPremium, true)));

    if (content.length === 0) {
      return json({ success: false, message: 'Content not found or not premium' }, 404);
    }

    const item = content[0];
    // Always charge the price the admin set — never a client-supplied number.
    const price = parseFloat(item.price?.toString() || '0');

    // Check if already purchased
    const existing = await db
      .select()
      .from(userContentPurchases)
      .where(and(
        eq(userContentPurchases.userId, authUser.id),
        eq(userContentPurchases.contentId, contentId)
      ));

    if (existing.length > 0) {
      return json({ success: false, message: 'You already own this content' }, 409);
    }

    // Process purchase from wallet
    const result = await processContentPurchase(authUser.id, contentId, price, item.title);

    if (result.success) {
      return json({
        success: true,
        message: result.message,
        newBalance: result.newBalance,
      });
    }

    // Wallet cannot cover it — take the buyer to PayChangu for this book.
    if (result.error === 'INSUFFICIENT_BALANCE' && price > 0) {
      const me = await db
        .select({ id: users.id, fullName: users.fullName, email: users.email })
        .from(users)
        .where(eq(users.id, authUser.id))
        .limit(1);

      if (me.length === 0) {
        return json({ success: false, message: 'Account not found' }, 404);
      }

      const nameParts = (me[0].fullName || 'Member').trim().split(/\s+/);
      const origin = new URL(request.url).origin;

      try {
        const { txRef, checkoutUrl } = await startCheckout({
          userId: me[0].id,
          email: me[0].email,
          firstName: nameParts[0] || 'Member',
          lastName: nameParts.slice(1).join(' ') || 'Member',
          paymentType: 'book',
          amount: price,
          contentId,
          origin,
        });

        return json({
          success: false,
          requiresPayment: true,
          txRef,
          checkoutUrl,
          message: `Pay MWK ${price.toLocaleString()} to buy "${item.title}".`,
        });
      } catch (checkoutError) {
        console.error('Checkout creation failed:', checkoutError);
        return json(
          { success: false, message: 'Could not start the payment. Please try again.' },
          502
        );
      }
    }

    return json({ success: false, message: result.message }, 400);
  } catch (error) {
    console.error('Purchase error:', error);
    return json({ success: false, message: 'Purchase failed' }, 500);
  }
};
