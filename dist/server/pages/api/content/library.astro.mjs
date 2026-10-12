import { d as db, c as contentItems, a as contentCategories } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq, desc } from 'drizzle-orm';
import { getAuthUser } from '../../../chunks/auth_CImtR7oD.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || !authUser.isSubscribed || !authUser.subscriptionExpiresAt) {
      return new Response(
        JSON.stringify({ success: false, isAuthenticated: false, message: "Login required", redirect: "/login" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const now = /* @__PURE__ */ new Date();
    if (authUser.subscriptionExpiresAt < now) {
      return new Response(
        JSON.stringify({ success: false, message: "Subscription expired" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const items = await db.select({
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
      createdAt: contentItems.createdAt
    }).from(contentItems).where(eq(contentItems.isPublished, true)).orderBy(desc(contentItems.createdAt));
    const categories = await db.select().from(contentCategories).where(eq(contentCategories.isActive, true)).orderBy(contentCategories.displayOrder);
    let purchasedContentIds = [];
    if (authUser.id) {
      try {
        const { getUserPurchasedContentIds } = await import('../../../chunks/purchases_XM3M2JdL.mjs');
        purchasedContentIds = await getUserPurchasedContentIds(authUser.id);
      } catch (e) {
        console.log("Could not fetch purchases:", e);
      }
    }
    const itemsWithAccess = items.map((item) => {
      const isOwned = !item.isPremium || purchasedContentIds.includes(item.id);
      return {
        ...item,
        isOwned,
        // Don't expose file_url for books if not owned (to prevent sharing)
        fileUrl: item.contentType === "book" && !isOwned ? null : item.fileUrl
      };
    });
    return new Response(
      JSON.stringify({
        success: true,
        isAuthenticated: true,
        items: itemsWithAccess,
        categories,
        totalItems: items.length
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Library API error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch library" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
