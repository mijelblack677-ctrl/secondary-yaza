import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_njTcWfK9.mjs';
import { i as icons } from '../chunks/icons_DHD92_qN.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Secondary Yaza", "description": "Secondary Yaza \u2014 a paid reading site for secondary school students. Understand difficult topics easily and test yourself with exam questions." }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="section-strong hero-strong"> <span class="check-pattern" aria-hidden="true"></span> <div class="hero-head"> <div class="hero-copy"> <p class="hero-kicker">Reading Site for Secondary School Students</p> <div class="hero-number">01</div> <p class="hero-sub">Read simply. Test yourself. Pass exams.</p> <h1 class="headline">
Difficult topics,<br>
made <span class="italic">easy</span> to understand.
</h1> <p class="intro">
Secondary Yaza is a paid reading site for secondary school students.
          Read clear, simplified explanations of hard topics, then test yourself
          with exam questions — all in one place.
</p> <div class="hero-actions"> <a href="/library" class="btn-gold">Explore Library</a> <a href="/register" class="btn-ghost">Get Started</a> </div> </div> <div class="hero-art"> <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=70" alt="Shelves of books in a library" loading="eager"> </div> </div> <div class="hero-detail"> <div class="stat-row"> <div class="stat"> <div class="num">50+</div> <div class="lbl">School Subjects</div> </div> <div class="stat"> <div class="num">10K+</div> <div class="lbl">Study Materials</div> </div> <div class="stat"> <div class="num">25K+</div> <div class="lbl">Students</div> </div> </div> </div> </section>  <section class="features"> <div class="container"> <div class="section-header"> <span class="badge">Built For Your Studies</span> <h2>What you will find</h2> <p>Everything you need to understand a topic and prepare for exams.</p> </div> <div class="features-grid"> <a href="/library" class="feature-card"> <div class="feature-icon">${unescapeHTML(icons.book)}</div> <h3>Simplified Notes</h3> <p>Difficult topics broken down into clear, easy-to-understand reading.</p> </a> <a href="/library" class="feature-card"> <div class="feature-icon">${unescapeHTML(icons.file)}</div> <h3>Study Guides</h3> <p>Subject-by-subject guides that match what you learn in class.</p> </a> <a href="/library" class="feature-card"> <div class="feature-icon">${unescapeHTML(icons.graduation)}</div> <h3>Exam Questions</h3> <p>Test yourself on past and practice exam papers before the real test.</p> </a> <a href="/library" class="feature-card"> <div class="feature-icon">${unescapeHTML(icons.search)}</div> <h3>Reference Material</h3> <p>Curated sources selected for revision, assignments and exam prep.</p> </a> </div> </div> </section>  <section class="section-strong cta-strong"> <div class="container text-center"> <p class="hero-kicker">Start reading today</p> <h2 class="headline">A reading site built <span class="italic">for students.</span></h2> <p class="intro">
Create an account to start reading. Free titles open instantly — unlock the
        full member collection with a monthly subscription via secure PayChangu payment.
</p> <div class="hero-actions"> <a href="/register" class="btn-gold">Create Account</a> <a href="/login" class="btn-ghost">Sign In</a> </div> </div> </section> ` })}`;
}, "/workspace/src/pages/index.astro", void 0);

const $$file = "/workspace/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
