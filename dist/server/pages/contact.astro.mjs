import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_njTcWfK9.mjs';
export { renderers } from '../renderers.mjs';

const $$Contact = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contact", "description": "Contact Secondary Yaza for support, questions, or partnership enquiries." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="container" style="padding: 3.5rem var(--page-x) 4rem; max-width: 1100px;"> <div class="section-header"> <span class="badge" style="margin-bottom: 1rem;">Get in touch</span> <h1>Contact Us</h1> <p>For inquiries, support, or general questions about the library.</p> </div> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2.5rem; align-items: start;"> <div> <h2 style="font-size: 1.25rem; margin-bottom: 1.25rem;">Contact information</h2> <div style="margin-bottom: 1.5rem;"> <h3 style="font-family: var(--font-sans); font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 0.35rem;">Email</h3> <a href="mailto:support@secondaryyaza.com" style="font-family: var(--font-body); font-size: 18px;">support@secondaryyaza.com</a> </div> <div style="margin-bottom: 1.5rem;"> <h3 style="font-family: var(--font-sans); font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 0.35rem;">Phone</h3> <p style="font-family: var(--font-body); font-size: 18px; margin-bottom: 0.15rem;">+265 123 456 789</p> <p class="text-muted" style="font-family: var(--font-sans); font-size: 12.5px;">Monday – Friday, 8AM – 5PM</p> </div> <div> <h3 style="font-family: var(--font-sans); font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 0.35rem;">Location</h3> <p style="font-family: var(--font-body); font-size: 18px; margin-bottom: 0.15rem;">Secondary Yaza Headquarters</p> <p class="text-muted" style="font-family: var(--font-sans); font-size: 12.5px;">Government District, City Center</p> </div> </div> <div class="form-card"> <h2 style="font-size: 1.25rem; margin-bottom: 1.25rem;">Send a message</h2> <form id="contact-form"> <div class="form-group"> <label class="form-label" for="name">Name</label> <input type="text" id="name" class="form-input" placeholder="Your full name" autocomplete="name"> </div> <div class="form-group"> <label class="form-label" for="email">Email address</label> <input type="email" id="email" class="form-input" placeholder="you@example.com" autocomplete="email"> </div> <div class="form-group"> <label class="form-label" for="message">Message</label> <textarea id="message" class="form-textarea" rows="5" placeholder="How can we help?" required></textarea> </div> <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button> <p class="text-muted" id="contact-status" style="font-family: var(--font-sans); font-size: 12.5px; text-align: center; margin-top: 0.85rem; display: none;"></p> </form> </div> </div> </section>  ` })}`;
}, "/workspace/src/pages/contact.astro", void 0);

const $$file = "/workspace/src/pages/contact.astro";
const $$url = "/contact";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Contact,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
