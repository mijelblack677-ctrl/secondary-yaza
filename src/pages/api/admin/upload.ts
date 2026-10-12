export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { contentItems } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin, unauthorized } from '@lib/adminAuth';
import fs from 'fs';
import path from 'path';

const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const thumbnail = formData.get('thumbnail') as File | null;
    const contentId = formData.get('contentId') as string;
    const title = formData.get('title') as string;

    const hasFile = !!file && file.size > 0;
    const hasThumbnail = !!thumbnail && thumbnail.size > 0;

    // A file is required to create new content; when linking to existing
    // content the file may be omitted (e.g. adding just a cover photo).
    if (!hasFile && !contentId) {
      return json({ success: false, message: 'No file uploaded' }, 400);
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    // Cover images live in a separately-served public folder (/covers) so the
    // nginx deny on /uploads/ (which protects book files) doesn't hide them.
    const coversDir = path.join(process.cwd(), 'public', 'covers');
    if (hasThumbnail && !fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true });
    }

    const fileUrl = hasFile ? await saveUpload(file!, uploadDir, '/uploads') : '';

    // Optional cover image — only accept real images, within the size cap.
    let thumbnailUrl = '';
    if (hasThumbnail) {
      if (!thumbnail!.type.startsWith('image/')) {
        return json({ success: false, message: 'Cover must be an image file' }, 400);
      }
      if (thumbnail!.size > MAX_THUMBNAIL_BYTES) {
        return json({ success: false, message: 'Cover image must be 5 MB or smaller' }, 400);
      }
      thumbnailUrl = await saveUpload(thumbnail!, coversDir, '/covers');
      // The standalone server serves static files from the build output
      // (dist/client), so mirror the cover there too for immediate serving;
      // it stays in public/covers so it survives the next rebuild.
      try {
        const clientCovers = path.join(process.cwd(), 'dist', 'client', 'covers');
        fs.mkdirSync(clientCovers, { recursive: true });
        fs.copyFileSync(path.join(coversDir, path.basename(thumbnailUrl)), path.join(clientCovers, path.basename(thumbnailUrl)));
      } catch { /* best-effort */ }
    }

    // Determine content type from extension
    const ext = fileUrl ? path.extname(fileUrl).toLowerCase() : '';
    const typeMap: Record<string, string> = {
      '.pdf': 'book',
      '.epub': 'book',
      '.doc': 'book',
      '.docx': 'book',
      '.txt': 'book',
      '.mp4': 'video',
      '.mov': 'video',
      '.mp3': 'audio',
      '.jpg': 'guide',
      '.jpeg': 'guide',
      '.png': 'guide',
    };
    const contentType = typeMap[ext] || 'guide';

    // Link to (or update) existing content.
    if (contentId) {
      const update: Record<string, unknown> = { isPublished: true };
      if (fileUrl) {
        update.fileUrl = fileUrl;
        update.contentType = contentType;
      }
      if (thumbnailUrl) update.thumbnailUrl = thumbnailUrl;

      await db.update(contentItems).set(update).where(eq(contentItems.id, contentId));

      return json({
        success: true,
        message: thumbnailUrl && !fileUrl
          ? 'Cover photo updated'
          : 'File uploaded and linked to content',
        fileUrl: fileUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        contentType: fileUrl ? contentType : undefined,
      });
    }

    if (!hasFile) {
      return json({ success: false, message: 'A book file is required' }, 400);
    }

    // Otherwise, if title provided, create new content
    if (title) {
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`;
      const categoryId = formData.get('categoryId') as string;

      if (!categoryId) {
        return json({ success: false, message: 'Category ID required for new content' }, 400);
      }

      const author = ((formData.get('author') as string) || '').trim() || 'Secondary Yaza';
      const description = ((formData.get('description') as string) || '').trim();
      const isPremium = formData.get('is_premium') === 'true';
      const priceInput = parseFloat((formData.get('price') as string) || '0');
      const price = isPremium && Number.isFinite(priceInput) && priceInput > 0 ? String(priceInput) : '0';

      const newItem = await db.insert(contentItems).values({
        id: crypto.randomUUID(),
        categoryId,
        title: title || file!.name,
        slug,
        description,
        contentType,
        fileUrl,
        thumbnailUrl,
        author,
        isFeatured: false,
        isPublished: true,
        isPremium,
        price,
      }).returning();

      return json({
        success: true,
        message: 'File uploaded and new content created',
        fileUrl,
        thumbnailUrl: thumbnailUrl || undefined,
        contentType,
        item: newItem[0],
      }, 201);
    }

    // Just upload without linking
    return json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl,
      thumbnailUrl: thumbnailUrl || undefined,
      contentType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return json(
      { success: false, message: error instanceof Error ? error.message : 'Upload failed' },
      500
    );
  }
};

async function saveUpload(file: File, uploadDir: string, publicPrefix: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${safeName}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));
  return `${publicPrefix}/${filename}`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
