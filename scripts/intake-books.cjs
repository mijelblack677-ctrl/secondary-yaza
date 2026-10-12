#!/usr/bin/env node

/**
 * Intake the Malawi Science Books project into the Secondary Yaza database.
 *
 *  - every .md under content/ (source of truth) -> converted to HTML via pandoc
 *  - every .docx book in the books folder        -> converted to HTML via pandoc
 *
 * Each book becomes a published, free content_item whose file_url points at the
 * generated HTML under public/uploads/, so the reader renders it inline.
 *
 * Idempotent: re-running updates existing rows by slug (never duplicates).
 *
 * Usage:
 *   node scripts/intake-books.cjs
 *
 * Env:
 *   DATABASE_URL  (required; same connection string the app uses)
 *   BOOKS_DIR     (optional; defaults to <repo>/malawi_science_books)
 *
 * Requires pandoc on PATH (2.x and 3.x are both supported).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BOOKS_DIR = process.env.BOOKS_DIR || path.join(__dirname, '..', 'malawi_science_books');
const MD_ROOT = path.join(BOOKS_DIR, 'content'); // source .md files
const APP_ROOT = path.join(__dirname, '..');

const { Pool } = require('pg');
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({ host: '127.0.0.1', port: 5432, database: 'secondary_yaza', user: 'miracleb' });

// ---- text helpers ----

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

function readMdTitle(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return path.basename(filePath, '.md');
  const title = m[1].match(/^title:\s*(.+)$/m);
  return title ? title[1].trim() : path.basename(filePath, '.md');
}

/** Turn PHY_F4_CH01_ThermalExpansion into "Ch 1 — Thermal Expansion". */
function titleFromFilename(base) {
  return base
    .replace(/^PHY_F4_/, '')
    .replace(/^CH0*(\d+)_/, 'Ch $1 — ')
    .replace(/^U0*(\d+)_/, 'Unit $1 — ')
    .replace(/^ELEC_M(\d+)_/, 'Electricity Module $1 — ')
    .replace(/^ELEC_M(\d+)$/, 'Electricity Module $1')
    .replace(/^0*(\d+)_/, '$1. ')
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---- pandoc ----

function sanitize(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '');
}

/**
 * Older pandoc (--self-contained, < 2.19) emits a whole HTML document; the
 * reader injects the result into a <div>, so unwrap it to the <body> contents.
 * Modern pandoc already returns a fragment and passes straight through.
 */
function toFragment(html) {
  if (!/<html[\s>]/i.test(html)) return html;
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return body ? body[1] : html;
}

/**
 * pandoc >= 2.19 uses --embed-resources; older builds (e.g. 2.14) only know
 * --self-contained — try the modern flag first and fall back.
 */
function runPandoc(args) {
  const opts = { maxBuffer: 128 * 1024 * 1024, encoding: 'utf8' };
  let html;
  let lastErr;
  for (const flag of ['--embed-resources', '--self-contained']) {
    try {
      html = execFileSync('pandoc', [...args, flag], opts);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) {
    // Markdown needs no resource embedding; retry once without the flag.
    html = execFileSync('pandoc', args, opts);
  }
  return sanitize(toFragment(html));
}

/** .docx -> HTML fragment with images embedded as data URIs. */
function docxToHtml(filePath) {
  return runPandoc([filePath, '-f', 'docx', '-t', 'html', '--wrap=none']);
}

/** .md -> HTML fragment. */
function markdownToHtml(filePath) {
  return runPandoc([filePath, '-f', 'markdown', '-t', 'html', '--wrap=none']);
}

// ---- filesystem / db ----

/** Recursively list files under dir matching ext, skipping excluded dir names. */
function walk(dir, ext, skipDirs) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) out.push(...walk(full, ext, skipDirs));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

/** Write the rendered HTML where the reader can serve it. */
function writeServed(name, html) {
  const cacheFile = path.join(APP_ROOT, '.cache', 'reader', name);
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  fs.writeFileSync(cacheFile, html, 'utf8');

  const publicFile = path.join(APP_ROOT, 'public', 'uploads', name);
  fs.mkdirSync(path.dirname(publicFile), { recursive: true });
  fs.writeFileSync(publicFile, html, 'utf8');
}

async function upsert({ categoryId, title, slug, fileUrl }) {
  await pool.query(
    `INSERT INTO content_items
       (id, category_id, title, slug, description, content_type, file_url, thumbnail_url,
        author, is_featured, is_published, is_premium, price, view_count, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, '', 'book', $4, NULL,
        'Secondary Yaza', FALSE, TRUE, FALSE, '0', 0, NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        title       = EXCLUDED.title,
        file_url    = EXCLUDED.file_url,
        is_published = TRUE,
        updated_at  = NOW()`,
    [categoryId, title, slug, fileUrl]
  );
}

async function main() {
  // Source markdown under content/ (skip stray README).
  const mdFiles = walk(MD_ROOT, '.md', ['node_modules', '.git'])
    .filter((f) => path.basename(f).toLowerCase() !== 'readme.md');

  // Built .docx books; skip templates/copies already staged elsewhere.
  const docxFiles = walk(BOOKS_DIR, '.docx', ['build', 'content', 'public', 'node_modules', '.git'])
    .filter((f) => !path.basename(f).startsWith('.~lock'));

  if (mdFiles.length === 0 && docxFiles.length === 0) {
    console.log('No books found to intake.');
    return;
  }

  const cats = await pool.query(
    `SELECT id, slug FROM content_categories WHERE slug IN ('physics', 'chemistry')`
  );
  const catMap = new Map(cats.rows.map((r) => [r.slug, r.id]));
  if (catMap.size === 0) {
    console.error('No physics/chemistry categories found. Run db:init first.');
    process.exit(1);
  }
  const physicsId = catMap.get('physics') || catMap.get('chemistry');

  let count = 0;

  // Markdown source books.
  for (const mdFile of mdFiles) {
    const title = readMdTitle(mdFile);
    const slug = slugify(title) || slugify(path.basename(mdFile, '.md'));
    const servedFileName = `${slug}.html`;
    writeServed(servedFileName, markdownToHtml(mdFile));
    await upsert({ categoryId: physicsId, title, slug, fileUrl: `/uploads/${servedFileName}` });
    console.log(`  [md]   ${title}  ->  ${slug}`);
    count++;
  }

  // Docx books (slug from basename so duplicate copies collapse onto one row).
  for (const docx of docxFiles) {
    const base = path.basename(docx, '.docx');
    const slug = slugify(base);
    const title = titleFromFilename(base);
    const servedFileName = `${slug}.html`;
    writeServed(servedFileName, docxToHtml(docx));
    await upsert({ categoryId: physicsId, title, slug, fileUrl: `/uploads/${servedFileName}` });
    console.log(`  [docx] ${title}  ->  ${slug}`);
    count++;
  }

  const total = await pool.query(`SELECT count(*)::int AS n FROM content_items WHERE is_published`);
  console.log(`\nDone — ${count} book files processed; ${total.rows[0].n} published books in the library.`);
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error('Intake failed:', err);
    await pool.end().catch(() => {});
    process.exit(1);
  });
