import fs from 'fs';
import path from 'path';
import { Readable } from 'node:stream';
import { execFileSync } from 'node:child_process';
import { d as db, c as contentItems, g as userContentPurchases } from '../../../../chunks/index_Bl8uyV_y.mjs';
import { and, eq } from 'drizzle-orm';
import { getAuthUser, getUserFromSession } from '../../../../chunks/auth_CImtR7oD.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const TEXT_EXTENSIONS = [".txt", ".md", ".markdown"];
const HTML_EXTENSIONS = [".html", ".htm"];
const CONVERTIBLE_EXTENSIONS = [".docx", ".doc", ".odt", ".rtf", ".epub"];
const GET = async ({ params, request, url }) => {
  try {
    const id = params.id;
    if (!id) {
      return json({ success: false, message: "Missing book ID" }, 400);
    }
    const mode = url.searchParams.get("mode");
    const wantsStream = !mode;
    const authUser = await getAuthUser(request) || (wantsStream ? await getUserFromSession(url.searchParams.get("token") || void 0) : null);
    if (!authUser) {
      return json({ success: false, message: "Login required" }, 401);
    }
    const now = /* @__PURE__ */ new Date();
    if (!authUser.isSubscribed || !authUser.subscriptionExpiresAt) {
      return json({ success: false, message: "Login required" }, 401);
    }
    if (authUser.subscriptionExpiresAt < now) {
      return json({ success: false, message: "Subscription expired" }, 403);
    }
    const items = await db.select().from(contentItems).where(and(eq(contentItems.id, id), eq(contentItems.isPublished, true)));
    if (items.length === 0) {
      return json({ success: false, message: "Book not found" }, 404);
    }
    const item = items[0];
    if (item.isPremium) {
      const owned = await db.select().from(userContentPurchases).where(and(
        eq(userContentPurchases.userId, authUser.id),
        eq(userContentPurchases.contentId, id)
      ));
      if (owned.length === 0) {
        return json({ success: false, message: "Purchase required to read this book" }, 403);
      }
    }
    const fileUrl = item.fileUrl;
    if (!fileUrl) {
      return json({ success: false, message: "This book has no readable file" }, 404);
    }
    const ext = path.extname(fileUrl).toLowerCase();
    const isLocal = fileUrl.startsWith("/uploads/");
    const filePath = isLocal ? path.join(process.cwd(), "public", fileUrl) : null;
    if (filePath && !fs.existsSync(filePath)) {
      return json({ success: false, message: "File not found on server" }, 404);
    }
    const size = filePath ? fs.statSync(filePath).size : null;
    const renderMode = getRenderMode(ext);
    if (mode === "meta") {
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
        textMode: renderMode === "text",
        fileUrl
      });
    }
    if (mode === "html") {
      if (!filePath || renderMode !== "html") {
        return json({ success: false, message: "This format cannot be displayed inline" }, 400);
      }
      let html;
      if (HTML_EXTENSIONS.includes(ext)) {
        try {
          html = sanitize(fs.readFileSync(filePath, "utf8"));
        } catch {
          html = null;
        }
      } else {
        html = convertToHtml(filePath, item.id, size ?? 0);
      }
      if (html === null) {
        return json({ success: false, message: "Could not render this document" }, 500);
      }
      return json({ success: true, html });
    }
    if (mode === "text") {
      if (!filePath || renderMode !== "text") {
        return json({ success: false, message: "This format cannot be displayed as text" }, 400);
      }
      const raw = fs.readFileSync(filePath, "utf8");
      const blocks = raw.split(/\r?\n\s*\r?\n/).map((para) => para.trim()).filter(Boolean).map((text) => ({ type: "p", text }));
      return json({ success: true, blocks });
    }
    if (filePath) {
      const stream = Readable.toWeb(fs.createReadStream(filePath));
      const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
      const downloadName = safeDownloadName(item.title, ext);
      return new Response(stream, {
        status: 200,
        headers: {
          "Referrer-Policy": "no-referrer",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
          "Content-Type": getContentType(ext),
          "Content-Disposition": `${disposition}; filename="${downloadName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
          "Content-Length": String(size),
          "Cache-Control": "private, max-age=3600"
        }
      });
    }
    return json({
      success: true,
      message: "External file",
      url: fileUrl,
      title: item.title
    });
  } catch (error) {
    console.error("Book read error:", error);
    return json({ success: false, message: "Could not open this book" }, 500);
  }
};
function convertToHtml(filePath, id, mtime) {
  const cacheDir = path.join(process.cwd(), ".cache", "reader");
  const cacheFile = path.join(cacheDir, `${id}-${mtime}.html`);
  try {
    if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile, "utf8");
  } catch {
  }
  try {
    const baseArgs = [filePath, "-f", extToFormat(filePath), "-t", "html", "--wrap=none"];
    const opts = { maxBuffer: 128 * 1024 * 1024, encoding: "utf8" };
    let html = "";
    let lastErr = null;
    for (const flag of ["--embed-resources", "--self-contained"]) {
      try {
        html = execFileSync("pandoc", [...baseArgs, flag], opts);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (lastErr) throw lastErr;
    const safe = sanitize(toFragment(html));
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(cacheFile, safe, "utf8");
    } catch {
    }
    return safe;
  } catch (error) {
    console.error("Document conversion failed:", error);
    return null;
  }
}
function sanitize(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=\s*"[^"]*"/gi, "").replace(/\son\w+\s*=\s*'[^']*'/gi, "");
}
function toFragment(html) {
  if (!/<html[\s>]/i.test(html)) return html;
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return body ? body[1] : html;
}
function extToFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".docx": "docx",
    ".doc": "doc",
    ".odt": "odt",
    ".rtf": "rtf",
    ".epub": "epub"
  };
  return map[ext] || "docx";
}
function getRenderMode(ext) {
  if (TEXT_EXTENSIONS.includes(ext)) return "text";
  if (ext === ".pdf") return "pdf";
  if (HTML_EXTENSIONS.includes(ext)) return "html";
  if (CONVERTIBLE_EXTENSIONS.includes(ext)) return "html";
  return "download";
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Keep request URLs (which may carry a one-time ?token= for the PDF
      // iframe) out of the Referer header on any outbound navigation.
      "Referrer-Policy": "no-referrer"
    }
  });
}
function formatLabel(ext, contentType) {
  const labels = {
    ".html": "Book",
    ".htm": "Book",
    ".pdf": "PDF",
    ".epub": "EPUB",
    ".doc": "Word Document",
    ".docx": "Word Document",
    ".txt": "Plain Text",
    ".md": "Markdown",
    ".markdown": "Markdown",
    ".rtf": "Rich Text"
  };
  return labels[ext] || (contentType ? contentType.toUpperCase() : "File");
}
function safeDownloadName(title, ext) {
  const base = (title || "book").replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/\s+/g, "_").slice(0, 80) || "book";
  return `${base}${ext || ""}`;
}
function getContentType(ext) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".pdf": "application/pdf",
    ".epub": "application/epub+zip",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".rtf": "application/rtf"
  };
  return types[ext] || "application/octet-stream";
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
