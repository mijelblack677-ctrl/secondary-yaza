import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_njTcWfK9.mjs';
import { i as icons } from '../chunks/icons_DHD92_qN.mjs';
export { renderers } from '../renderers.mjs';

const $$Library = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Library", "description": "Browse our collection of books and educational resources" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="container" style="padding: 3rem var(--page-x) 1.5rem; max-width: 1280px;"> <div style="text-align: center; margin-bottom: 2.25rem;"> <span class="badge" style="display: inline-block; margin-bottom: 1rem;">Digital Collection</span> <h1 style="margin-bottom: 0.5rem;">Library</h1> <p class="text-muted" style="max-width: 520px; margin: 0.5rem auto 0; font-family: var(--font-body); font-size: 17px;">
Browse the collection of books and educational resources. Purchase premium titles to read instantly.
</p> </div> <div style="display: flex; gap: 0.75rem; margin-bottom: 1.75rem; flex-wrap: wrap; justify-content: center;"> <select id="category-filter" class="form-input" style="flex: 0 1 240px; min-width: 180px;"> <option value="all">All Categories</option> </select> <select id="type-filter" class="form-input" style="flex: 0 0 auto; min-width: 150px;"> <option value="all">All Types</option> <option value="book">Books</option> <option value="video">Videos</option> <option value="audio">Audio</option> </select> </div> <div id="loading" class="loading"> <div class="spinner"></div> <p class="text-muted">Loading…</p> </div> <div id="library-grid" style="display: none; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.25rem;"></div> <div id="empty-state" class="empty-state" style="display: none;"> <div class="icon">${unescapeHTML(icons.inbox)}</div> <h3>No resources found</h3> <p>Try adjusting your filters or check back later for new content.</p> </div> <div id="subscribe-msg" style="display: none; margin-top: 2rem; padding: 1rem 1.25rem; border-radius: var(--radius-sm); background: var(--surface); border: 1px solid var(--line); text-align: center;"> <p style="margin: 0 0 0.4rem;">To borrow and read books you must be a subscriber.</p> <a href="/login?redirect=/library" class="btn" style="text-decoration: none;">Sign in</a> </div> </section>  ` })}`;
}, "/workspace/src/pages/library.astro", void 0);

const $$file = "/workspace/src/pages/library.astro";
const $$url = "/library";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Library,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
