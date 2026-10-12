import { d as db, c as contentItems, a as contentCategories } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq, desc } from 'drizzle-orm';
import { r as requireAdmin, u as unauthorized } from '../../../chunks/adminAuth_B5NQ_82p.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all";
    let items;
    if (type === "books") {
      items = await db.select().from(contentItems).where(eq(contentItems.contentType, "book")).orderBy(desc(contentItems.createdAt));
    } else if (type === "published") {
      items = await db.select().from(contentItems).where(eq(contentItems.isPublished, true)).orderBy(desc(contentItems.createdAt));
    } else {
      items = await db.select().from(contentItems).orderBy(desc(contentItems.createdAt));
    }
    const categories = await db.select().from(contentCategories).where(eq(contentCategories.isActive, true)).orderBy(contentCategories.displayOrder);
    return new Response(
      JSON.stringify({ success: true, items: items || [], categories: categories || [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin content GET error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Failed to fetch content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const POST = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();
  try {
    const body = await request.json();
    const {
      title,
      description,
      content_type,
      category_id,
      author,
      is_premium,
      price,
      is_featured,
      file_url,
      thumbnail_url
    } = body;
    if (!title || !content_type || !category_id) {
      return new Response(
        JSON.stringify({ success: false, message: "Title, content type, and category are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
    const newItem = await db.insert(contentItems).values({
      id: crypto.randomUUID(),
      categoryId: category_id,
      title,
      slug,
      description: description || "",
      contentType: content_type,
      fileUrl: file_url || "",
      thumbnailUrl: thumbnail_url || "",
      author: author || "Secondary Yaza",
      isFeatured: is_featured || false,
      isPublished: true,
      isPremium: is_premium || false,
      price: price || "0"
    }).returning();
    return new Response(
      JSON.stringify({ success: true, message: "Content created successfully", item: newItem[0] }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin content POST error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Failed to create content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const DELETE = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();
  try {
    const body = await request.json();
    const { contentId } = body;
    if (!contentId) {
      return new Response(
        JSON.stringify({ success: false, message: "Content ID required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await db.delete(contentItems).where(eq(contentItems.id, contentId));
    return new Response(
      JSON.stringify({ success: true, message: "Content deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin content DELETE error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Failed to delete content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
