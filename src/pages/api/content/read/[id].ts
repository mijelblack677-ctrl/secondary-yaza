export const prerender = false;

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { Readable } from 'node:stream';
import { execFileSync } from 'node:child_process';
import { db } from '@lib/db';
import { contentItems, userContentPurchases } from '@lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser, getUserFromSession } from '@lib/auth';

const TEXT_EXTENSIONS = ['.txt', '.md', '.markdown'];
// Already-HTML books (e.g. docx pre-converted at intake time) — served inline.
const HTML_EXTENSIONS = ['.html', '.htm'];
// Formats pandoc can turn into inline HTML on the fly.
const CONVERTIBLE_EXTENSIONS = ['.docx', '.doc', '.odt', '.rtf', '.epub'];

export const GET: APIRoute = async ({ params, request, url }) => {
  try {
    const id = params.id;
    if (!id) {
      return json({ success: false, message: 'Missing book ID' }, 400);
    }

    const mode = url.searchParams.get('mode');

    // Auth via the HttpOnly session cookie (or Authorization header). The
    // `?token=` fallback is only honoured when streaming a PDF body (no mode)
    // — an <iframe>/<a download> cannot send headers. It is NOT accepted for
    // meta/text/html modes, and those responses set Referrer-Policy: no-referrer
    // so the book URL (with its token) never leaks to third parties.
    const wantsStream = !mode;
    const authUser =
      (await getAuthUser(request)) ||
      (wantsStream
        ? await getUserFromSession(url.searchParams.get('token') || undefined)
        : null);

    if (!authUser) {
      return json({ success: false, message: 'Login required' }, 401);
    }

    // Subscriber-only: only an authenticated, active subscriber may open a
    // book. Everyone else gets 403. The same rule is enforced client-side in
    // library.astro, but the server is the one that actually protects the file.
    const now = new Date();
    if (!authUser.isSubscribed || !authUser.subscriptionExpiresAt) {
      return json({ success: false, message: 'Login required' }, 401);
    }
    if (authUser.subscriptionExpiresAt < now) {
      return json({ success: false, message: 'Subscription expired' }, 403);
    }

    const items = await db
      .select()
      .from(contentItems)
      .where(and(eq(contentItems.id, id), eq(contentItems.isPublished, true)));

    if (items.length === 0) {
      return json({ success: false, message: 'Book not found' }, 404);
    }

    const item = items[0];

    if (item.isPremium) {
      const owned = await db
        .select()
        .from(userContentPurchases)
        .where(and(
          eq(userContentPurchases.userId, authUser.id),
          eq(userContentPurchases.contentId, id)
        ));

      if (owned.length === 0) {
        return json({ success: false, message: 'Purchase required to read this book' }, 403);
      }
    }

    const fileUrl = item.fileUrl;
    if (!fileUrl) {
      return json({ success: false, message: 'This book has no readable file' }, 404);
    }

    const ext = path.extname(fileUrl).toLowerCase();
    const isLocal = fileUrl.startsWith('/uploads/');
    const filePath = isLocal ? path.join(process.cwd(), 'public', fileUrl) : null;

    if (filePath && !fs.existsSync(filePath)) {
      return json({ success: false, message: 'File not found on server' }, 404);
    }

    const size = filePath ? fs.statSync(filePath).size : null;
    const renderMode = getRenderMode(ext);

    if (mode === 'meta') {
      return json({
        success: true,
        id: item.id,
        title: item.title,
        author: item.author,
        label: formatLabel(ext, item.contentType),
        ext,
        contentType: getContentType(ext),
        size,
        renderMode,
        textMode: renderMode === 'text',
        fileUrl,
      });
    }

    // Rendered HTML (converted + cached) for document formats.
    if (mode === 'html') {
      if (!filePath || renderMode !== 'html') {
        return json({ success: false, message: 'This format cannot be displayed inline' }, 400);
      }

      // HTML books are already rendered — read them straight from disk.
      // Everything else (docx/odt/…) goes through pandoc, cached by id+mtime.
      let html: string | null;
      if (HTML_EXTENSIONS.includes(ext)) {
        try {
          html = sanitize(fs.readFileSync(filePath, 'utf8'));
        } catch {
          html = null;
        }
      } else {
        html = convertToHtml(filePath, item.id, size ?? 0);
      }
      if (html === null) {
        return json({ success: false, message: 'Could not render this document' }, 500);
      }
      return json({ success: true, html });
    }

    // Plain-text contents, split into reader blocks.
    if (mode === 'text') {
      if (!filePath || renderMode !== 'text') {
        return json({ success: false, message: 'This format cannot be displayed as text' }, 400);
      }

      const raw = fs.readFileSync(filePath, 'utf8');
      const blocks = raw
        .split(/\r?\n\s*\r?\n/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((text) => ({ type: 'p', text }));

      return json({ success: true, blocks });
    }

    // Default: stream local files, redirect/describe external URLs.
    if (filePath) {
      const stream = Readable.toWeb(fs.createReadStream(filePath)) as unknown as ReadableStream;
      // `?download=1` forces a file save so readers can keep the book offline.
      const disposition = url.searchParams.get('download') === '1' ? 'attachment' : 'inline';
      const downloadName = safeDownloadName(item.title, ext);
      return new Response(stream, {
        status: 200,
        headers: {
          'Referrer-Policy': 'no-referrer',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
          'Content-Type': getContentType(ext),
          'Content-Disposition': `${disposition}; filename="${downloadName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
          'Content-Length': String(size),
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    return json({
      success: true,
      message: 'External file',
      url: fileUrl,
      title: item.title,
    });
  } catch (error) {
    console.error('Book read error:', error);
    return json({ success: false, message: 'Could not open this book' }, 500);
  }
};

/** ... (unchanged) */
function convertToHtml(filePath: string, id: string, mtime: number): string | null {
  const cacheDir = path.join(process.cwd(), '.cache', 'reader');
  const cacheFile = path.join(cacheDir, `${id}-${mtime}.html`);

  try {
    if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile, 'utf8');
  } catch {
    /* fall through and reconvert */
  }

  try {
    // pandoc >= 2.19 uses --embed-resources; older builds (e.g. 2.14)
    // only know --self-contained. Try the modern flag, then fall back.
    const baseArgs = [filePath, '-f', extToFormat(filePath), '-t', 'html', '--wrap=none'];
    const opts = { maxBuffer: 128 * 1024 * 1024, encoding: 'utf8' } as const;
    let html = '';
    let lastErr: unknown = null;
    for (const flag of ['--embed-resources', '--self-contained']) {
      try {
        html = execFileSync('pandoc', [...baseArgs, flag], opts);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (lastErr) throw lastErr;

    // Older pandoc (--self-contained) returns a whole document; the reader
    // injects this into a <div>, so unwrap it to the <body> contents.
    const safe = sanitize(toFragment(html));

    try {
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(cacheFile, safe, 'utf8');
    } catch {
      /* caching is best-effort */
    }

    return safe;
  } catch (error) {
    console.error('Document conversion failed:', error);
    return null;
  }
}

function sanitize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '');
}

/**
 * Reduce a full HTML document to its <body> contents. Modern pandoc returns a
 * fragment already, so this is a no-op there; older builds (--self-contained)
 * return a complete document, which must not be nested inside a <div>.
 */
function toFragment(html: string): string {
  if (!/<html[\s>]/i.test(html)) return html;
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return body ? body[1] : html;
}

function extToFormat(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    '.docx': 'docx',
    '.doc': 'doc',
    '.odt': 'odt',
    '.rtf': 'rtf',
    '.epub': 'epub',
  };
  return map[ext] || 'docx';
}

function getRenderMode(ext: string): 'text' | 'pdf' | 'html' | 'download' {
  if (TEXT_EXTENSIONS.includes(ext)) return 'text';
  if (ext === '.pdf') return 'pdf';
  if (HTML_EXTENSIONS.includes(ext)) return 'html';
  if (CONVERTIBLE_EXTENSIONS.includes(ext)) return 'html';
  return 'download';
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Keep request URLs (which may carry a one-time ?token= for the PDF
      // iframe) out of the Referer header on any outbound navigation.
      'Referrer-Policy': 'no-referrer',
    },
  });
}

function formatLabel(ext: string, contentType: string | null): string {
  const labels: Record<string, string> = {
    '.html': 'Book',
    '.htm': 'Book',
    '.pdf': 'PDF',
    '.epub': 'EPUB',
    '.doc': 'Word Document',
    '.docx': 'Word Document',
    '.txt': 'Plain Text',
    '.md': 'Markdown',
    '.markdown': 'Markdown',
    '.rtf': 'Rich Text',
  };
  return labels[ext] || (contentType ? contentType.toUpperCase() : 'File');
}

function safeDownloadName(title: string, ext: string): string {
  const base = (title || 'book')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'book';
  return `${base}${ext || ''}`;
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.pdf': 'application/pdf',
    '.epub': 'application/epub+zip',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.rtf': 'application/rtf',
  };
  return types[ext] || 'application/octet-stream';
}
