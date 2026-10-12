import { d as db, c as contentItems } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq } from 'drizzle-orm';
import { r as requireAdmin, u as unauthorized } from '../../../chunks/adminAuth_B5NQ_82p.mjs';
import fs from 'fs';
import path from 'path';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
const POST = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const thumbnail = formData.get("thumbnail");
    const contentId = formData.get("contentId");
    const title = formData.get("title");
    const hasFile = !!file && file.size > 0;
    const hasThumbnail = !!thumbnail && thumbnail.size > 0;
    if (!hasFile && !contentId) {
      return json({ success: false, message: "No file uploaded" }, 400);
    }
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const coversDir = path.join(process.cwd(), "public", "covers");
    if (hasThumbnail && !fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true });
    }
    const fileUrl = hasFile ? await saveUpload(file, uploadDir, "/uploads") : "";
    let thumbnailUrl = "";
    if (hasThumbnail) {
      if (!thumbnail.type.startsWith("image/")) {
        return json({ success: false, message: "Cover must be an image file" }, 400);
      }
      if (thumbnail.size > MAX_THUMBNAIL_BYTES) {
        return json({ success: false, message: "Cover image must be 5 MB or smaller" }, 400);
      }
      thumbnailUrl = await saveUpload(thumbnail, coversDir, "/covers");
      try {
        const clientCovers = path.join(process.cwd(), "dist", "client", "covers");
        fs.mkdirSync(clientCovers, { recursive: true });
        fs.copyFileSync(path.join(coversDir, path.basename(thumbnailUrl)), path.join(clientCovers, path.basename(thumbnailUrl)));
      } catch {
      }
    }
    const ext = fileUrl ? path.extname(fileUrl).toLowerCase() : "";
    const typeMap = {
      ".pdf": "book",
      ".epub": "book",
      ".doc": "book",
      ".docx": "book",
      ".txt": "book",
      ".mp4": "video",
      ".mov": "video",
      ".mp3": "audio",
      ".jpg": "guide",
      ".jpeg": "guide",
      ".png": "guide"
    };
    const contentType = typeMap[ext] || "guide";
    if (contentId) {
      const update = { isPublished: true };
      if (fileUrl) {
        update.fileUrl = fileUrl;
        update.contentType = contentType;
      }
      if (thumbnailUrl) update.thumbnailUrl = thumbnailUrl;
      await db.update(contentItems).set(update).where(eq(contentItems.id, contentId));
      return json({
        success: true,
        message: thumbnailUrl && !fileUrl ? "Cover photo updated" : "File uploaded and linked to content",
        fileUrl: fileUrl || void 0,
        thumbnailUrl: thumbnailUrl || void 0,
        contentType: fileUrl ? contentType : void 0
      });
    }
    if (!hasFile) {
      return json({ success: false, message: "A book file is required" }, 400);
    }
    if (title) {
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
      const categoryId = formData.get("categoryId");
      if (!categoryId) {
        return json({ success: false, message: "Category ID required for new content" }, 400);
      }
      const author = (formData.get("author") || "").trim() || "Secondary Yaza";
      const description = (formData.get("description") || "").trim();
      const isPremium = formData.get("is_premium") === "true";
      const priceInput = parseFloat(formData.get("price") || "0");
      const price = isPremium && Number.isFinite(priceInput) && priceInput > 0 ? String(priceInput) : "0";
      const newItem = await db.insert(contentItems).values({
        id: crypto.randomUUID(),
        categoryId,
        title: title || file.name,
        slug,
        description,
        contentType,
        fileUrl,
        thumbnailUrl,
        author,
        isFeatured: false,
        isPublished: true,
        isPremium,
        price
      }).returning();
      return json({
        success: true,
        message: "File uploaded and new content created",
        fileUrl,
        thumbnailUrl: thumbnailUrl || void 0,
        contentType,
        item: newItem[0]
      }, 201);
    }
    return json({
      success: true,
      message: "File uploaded successfully",
      fileUrl,
      thumbnailUrl: thumbnailUrl || void 0,
      contentType
    });
  } catch (error) {
    console.error("Upload error:", error);
    return json(
      { success: false, message: error instanceof Error ? error.message : "Upload failed" },
      500
    );
  }
};
async function saveUpload(file, uploadDir, publicPrefix) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${safeName}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));
  return `${publicPrefix}/${filename}`;
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
