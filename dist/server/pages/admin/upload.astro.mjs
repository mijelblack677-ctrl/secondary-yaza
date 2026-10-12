import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayoutNoHeader } from '../../chunks/BaseLayoutNoHeader_UchbvdSR.mjs';
export { renderers } from '../../renderers.mjs';

const $$Upload = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayoutNoHeader, { "title": "Upload Book", "description": "Add a new book to the library" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="admin-wrap"> <aside class="admin-sidebar"> <div class="admin-sidebar-inner"> <a href="/admin" class="admin-sidebar-logo"> <img src="/logo.svg" alt="Secondary Yaza"> <div class="admin-sidebar-wordmark">
Secondary <span>Yaza</span> <div class="admin-sidebar-tag">Administrator</div> </div> </a> <nav class="admin-nav"> <a href="/admin" class="admin-nav-item"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path> <polyline points="9 22 9 12 15 12 15 22"></polyline> </svg>
Dashboard
</a> <a href="/admin/content" class="admin-nav-item"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path> <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path> </svg>
Content
</a> <a href="/admin/upload" class="admin-nav-item active"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path> <polyline points="17 8 12 3 7 8"></polyline> <line x1="12" y1="3" x2="12" y2="15"></line> </svg>
Upload Book
</a> <a href="/admin/settings" class="admin-nav-item"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"> <circle cx="12" cy="12" r="3"></circle> <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2H3a2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 0 001.82-.33l.06.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path> </svg>
Settings
</a> </nav> <div class="admin-signout"> <a href="/admin/logout"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path> <polyline points="16 17 21 12 16 7"></polyline> <line x1="21" y1="12" x2="9" y2="12"></line> </svg>
Sign Out
</a> </div> </div> </aside> <main class="admin-main"> <div class="admin-topbar"> <div class="admin-topbar-left"> <h1 class="admin-page-title">Upload Book</h1> <p class="admin-page-sub">Add a new resource to the library</p> </div> <a href="/admin/content" class="admin-link"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path> <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path> </svg>
Back to Content
</a> </div> <div class="admin-section"> <form id="upload-form" class="admin-form"> <div class="admin-form-grid"> <div class="admin-form-group admin-form-group-full"> <label class="admin-form-label" for="file">
Book file <span class="admin-form-optional">*</span> </label> <input type="file" id="file" accept=".pdf,.epub,.doc,.docx,.txt" required> <div class="admin-form-hint">Supported formats: PDF, EPUB, DOC, DOCX, TXT</div> </div> <div class="admin-form-group admin-form-group-full"> <label class="admin-form-label" for="cover">Cover photo</label> <input type="file" id="cover" accept="image/png,image/jpeg,image/webp,image/gif"> <div class="admin-form-hint">Optional. JPG, PNG or WebP, up to 5 MB — shown as the book's cover in the library.</div> <div id="cover-preview" class="admin-cover-preview" hidden> <img alt="Cover preview"> <button type="button" id="cover-clear" class="admin-cover-clear" aria-label="Remove cover photo">Remove</button> </div> </div> <div class="admin-form-group"> <label class="admin-form-label" for="title">
Book title <span class="admin-form-optional">*</span> </label> <input type="text" id="title" placeholder="Enter book title" required> </div> <div class="admin-form-group"> <label class="admin-form-label" for="author">Author</label> <input type="text" id="author" placeholder="Author name"> </div> <div class="admin-form-group"> <label class="admin-form-label" for="category">
Category <span class="admin-form-optional">*</span> </label> <select id="category" required> <option value="">Select a category</option> </select> </div> <div class="admin-form-group"> <label class="admin-form-label" for="content-type">Content type</label> <select id="content-type"> <option value="book">Book</option> <option value="guide">Guide</option> </select> </div> <div class="admin-form-group"> <label class="admin-form-label">Pricing</label> <div class="admin-radio-group"> <label class="admin-radio"> <input type="radio" name="pricing" value="free" checked> <span>Free</span> </label> <label class="admin-radio"> <input type="radio" name="pricing" value="premium"> <span>Premium</span> </label> </div> <div class="admin-form-group" id="premium-price-group" style="display: none;"> <label class="admin-form-label" for="price">Price in MWK</label> <input type="number" id="price" min="100" step="100" placeholder="Price in MWK"> </div> </div> <div class="admin-form-group admin-form-group-full"> <label class="admin-form-label" for="description">Description</label> <textarea id="description" rows="4" placeholder="Brief description of the book..."></textarea> </div> </div> <div class="admin-error" id="form-error" hidden></div> <div class="admin-form-actions"> <button type="submit" class="admin-btn"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path> <polyline points="17 8 12 3 7 8"></polyline> <line x1="12" y1="3" x2="12" y2="15"></line> </svg>
Upload Book
</button> <a href="/admin/content" class="admin-btn admin-btn-outline">Cancel</a> </div> </form> </div> </main> </div>  ` })}`;
}, "/workspace/src/pages/admin/upload.astro", void 0);

const $$file = "/workspace/src/pages/admin/upload.astro";
const $$url = "/admin/upload";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Upload,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
