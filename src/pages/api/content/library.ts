export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { contentItems, contentCategories, userContentPurchases } from '@lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@lib/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Auth via the HttpOnly session cookie (or Authorization header).
    const authUser = await getAuthUser(request);

    // Subscriber-only: only an authenticated, active subscriber may see the
    // library. Everyone else gets a 401 with a redirect hint to /login.
    if (!authUser || !authUser.isSubscribed || !authUser.subscriptionExpiresAt) {
      return new Response(
        JSON.stringify({ success: false, isAuthenticated: false, message: 'Login required', redirect: '/login' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    if (authUser.subscriptionExpiresAt < now) {
      return new Response(
        JSON.stringify({ success: false, message: 'Subscription expired' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all published content
    const items = await db
      .select({
        id: contentItems.id,
        categoryId: contentItems.categoryId,
        title: contentItems.title,
        slug: contentItems.slug,
        description: contentItems.description,
        contentType: contentItems.contentType,
        fileUrl: contentItems.fileUrl,
        thumbnailUrl: contentItems.thumbnailUrl,
        author: contentItems.author,
        isFeatured: contentItems.isFeatured,
        isPublished: contentItems.isPublished,
        isPremium: contentItems.isPremium,
        price: contentItems.price,
        viewCount: contentItems.viewCount,
        createdAt: contentItems.createdAt,
      })
      .from(contentItems)
      .where(eq(contentItems.isPublished, true))
      .orderBy(desc(contentItems.createdAt));

    // Get categories
    const categories = await db
      .select()
      .from(contentCategories)
      .where(eq(contentCategories.isActive, true))
      .orderBy(contentCategories.displayOrder);

    // Get user's purchased content if logged in
    let purchasedContentIds: string[] = [];
    if (authUser.id) {
      try {
        const { getUserPurchasedContentIds } = await import('@lib/purchases');
        purchasedContentIds = await getUserPurchasedContentIds(authUser.id);
      } catch (e) {
        console.log('Could not fetch purchases:', e);
      }
    }

    // Enrich items with ownership info
    const itemsWithAccess = items.map((item: any) => {
      const isOwned = !item.isPremium || purchasedContentIds.includes(item.id);

      return {
        ...item,
        isOwned,
        // Don't expose file_url for books if not owned (to prevent sharing)
        fileUrl: item.contentType === 'book' && !isOwned ? null : item.fileUrl,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        isAuthenticated: true,
        items: itemsWithAccess,
        categories,
        totalItems: items.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Library API error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to fetch library' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
