export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { users, contentItems, userContentPurchases } from '@lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';
import { startCheckout, SUBSCRIPTION_MWK } from '@lib/payments';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/payments/create
 * Body: { type: 'subscription' } or { type: 'book', contentId }
 * Returns { success, txRef, checkoutUrl } — send the browser to checkoutUrl.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return json({ success: false, message: 'Authentication required' }, 401);
    }

    const body = await request.json().catch(() => ({}));
    const type = body?.type === 'book' ? 'book' : 'subscription';

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

    if (type === 'subscription') {
      const { txRef, checkoutUrl } = await startCheckout({
        userId: me[0].id,
        email: me[0].email,
        firstName: nameParts[0] || 'Member',
        lastName: nameParts.slice(1).join(' ') || 'Member',
        paymentType: 'subscription',
        amount: SUBSCRIPTION_MWK,
        origin,
      });

      return json({ success: true, txRef, checkoutUrl, amount: SUBSCRIPTION_MWK });
    }

    // type === 'book'
    const contentId = String(body?.contentId || '');
    if (!contentId) {
      return json({ success: false, message: 'contentId is required' }, 400);
    }

    const content = await db
      .select({
        id: contentItems.id,
        title: contentItems.title,
        price: contentItems.price,
        isPremium: contentItems.isPremium,
      })
      .from(contentItems)
      .where(eq(contentItems.id, contentId))
      .limit(1);

    if (content.length === 0) {
      return json({ success: false, message: 'Book not found' }, 404);
    }

    const amount = parseFloat(content[0].price?.toString() || '0');
    if (!(amount > 0)) {
      return json({ success: false, message: 'This book is free — no payment needed' }, 400);
    }

    const owned = await db
      .select({ id: userContentPurchases.id })
      .from(userContentPurchases)
      .where(and(
        eq(userContentPurchases.userId, authUser.id),
        eq(userContentPurchases.contentId, contentId)
      ))
      .limit(1);

    if (owned.length > 0) {
      return json({ success: false, message: 'You already own this book' }, 409);
    }

    const { txRef, checkoutUrl } = await startCheckout({
      userId: me[0].id,
      email: me[0].email,
      firstName: nameParts[0] || 'Member',
      lastName: nameParts.slice(1).join(' ') || 'Member',
      paymentType: 'book',
      amount,
      contentId,
      origin,
    });

    return json({ success: true, txRef, checkoutUrl, amount });
  } catch (error) {
    console.error('Payment create error:', error);
    return json(
      { success: false, message: 'Could not start the payment. Please try again.' },
      502
    );
  }
};
