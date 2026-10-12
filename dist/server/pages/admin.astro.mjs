import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayoutNoHeader } from '../chunks/BaseLayoutNoHeader_UchbvdSR.mjs';
import { i as icons } from '../chunks/icons_DHD92_qN.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayoutNoHeader, { "title": "Admin Dashboard" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="admin-wrap"> <aside class="admin-sidebar"> <div class="admin-sidebar-inner"> <a href="/admin" class="admin-sidebar-logo"> <img src="/logo.svg" alt="Secondary Yaza"> <div class="admin-sidebar-wordmark">
Secondary <span>Yaza</span> <div class="admin-sidebar-tag">Administrator</div> </div> </a> <nav class="admin-nav"> <a href="/admin" class="admin-nav-item active"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path> <polyline points="9 22 9 12 15 12 15 22"></polyline> </svg>
Dashboard
</a> <a href="/admin/content" class="admin-nav-item"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path> <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path> </svg>
Content
</a> <a href="/admin/upload" class="admin-nav-item"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path> <polyline points="17 8 12 3 7 8"></polyline> <line x1="12" y1="3" x2="12" y2="15"></line> </svg>
Upload Book
</a> <a href="/admin/settings" class="admin-nav-item"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"> <circle cx="12" cy="12" r="3"></circle> <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2H3a2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 0 001.82-.33l.06.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path> </svg>
Settings
</a> </nav> <div class="admin-signout"> <a href="/admin/logout"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path> <polyline points="16 17 21 12 16 7"></polyline> <line x1="21" y1="12" x2="9" y2="12"></line> </svg>
Sign Out
</a> </div> </div> </aside> <main class="admin-main"> <div class="admin-topbar"> <div class="admin-topbar-left"> <h1 class="admin-page-title">Dashboard</h1> <p class="admin-page-sub">Welcome back, Administrator</p> </div> <a href="/admin/upload" class="admin-btn"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path> <polyline points="17 8 12 3 7 8"></polyline> <line x1="12" y1="3" x2="12" y2="15"></line> </svg>
Upload
</a> </div> <div class="admin-stats"> <div class="admin-stat-card"> <div class="admin-stat-icon">${unescapeHTML(icons.book)}</div> <div class="admin-stat-num">0</div> <div class="admin-stat-label">Total Books</div> </div> <div class="admin-stat-card"> <div class="admin-stat-icon admin-stat-icon-green">${unescapeHTML(icons.check)}</div> <div class="admin-stat-num">0</div> <div class="admin-stat-label">Published</div> </div> <div class="admin-stat-card"> <div class="admin-stat-icon admin-stat-icon-gold">${unescapeHTML(icons.star)}</div> <div class="admin-stat-num">0</div> <div class="admin-stat-label">Premium</div> </div> </div> <div class="admin-section"> <h2 class="admin-section-title">Quick actions</h2> <div class="admin-actions"> <a href="/admin/upload" class="admin-btn admin-btn-outline"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path> <polyline points="17 8 12 3 7 8"></polyline> <line x1="12" y1="3" x2="12" y2="15"></line> </svg>
Upload New Book
</a> <a href="/admin/content" class="admin-link"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"> <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path> <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path> </svg>
Manage Content
</a> </div> </div> </main> </div> ` })}`;
}, "/workspace/src/pages/admin/index.astro", void 0);

const $$file = "/workspace/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
