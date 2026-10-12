import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_njTcWfK9.mjs';
import { i as icons } from '../chunks/icons_DHD92_qN.mjs';
export { renderers } from '../renderers.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "About", "description": "About Secondary Yaza \u2014 our mission, standards, and the people behind the collection." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="about"> <div class="container"> <div class="about-grid"> <div class="about-content"> <span class="badge">About Us</span> <h2>Our mission</h2> <p>
Secondary Yaza provides access to quality educational content and resources for students, researchers, and lifelong learners. We are committed to making knowledge accessible in a secure and well-organised environment.
</p> <p>
As an educational platform we maintain academic standards in how content is selected and presented. Our goal is to support learning and research with reliable, clearly organised material.
</p> <a href="/library" class="page-link">Browse the collection</a> </div> <div class="about-image-wrapper"> <div class="about-photo" aria-hidden="true"></div> </div> </div> </div> </section> <section class="features"> <div class="container"> <div class="section-header"> <h2>Platform features</h2> <p>Everything you need to read, study, and keep coming back.</p> </div> <div class="features-grid"> <div class="feature-card"> <div class="feature-icon">${unescapeHTML(icons.book)}</div> <h3>Curated Collection</h3> <p>Books and resources selected for educational value across multiple disciplines.</p> </div> <div class="feature-card"> <div class="feature-icon">${unescapeHTML(icons.lock)}</div> <h3>Secure Platform</h3> <p>Protected access with secure authentication and clear data protection measures.</p> </div> <div class="feature-card"> <div class="feature-icon">${unescapeHTML(icons.bookOpen)}</div> <h3>Reading Interface</h3> <p>A calm, focused reader designed for comfortable extended reading sessions.</p> </div> <div class="feature-card"> <div class="feature-icon">${unescapeHTML(icons.card)}</div> <h3>Access Options</h3> <p>Straightforward pricing for premium titles, with plenty available for free.</p> </div> </div> </div> </section> ` })}`;
}, "/workspace/src/pages/about.astro", void 0);

const $$file = "/workspace/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
