import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_njTcWfK9.mjs';
export { renderers } from '../renderers.mjs';

const $$Faq = createComponent(($$result, $$props, $$slots) => {
  const faqs = [
    {
      q: "How much does membership cost?",
      a: "Membership costs MWK 2,000 for 30 days. You can pay during registration or later from your membership page. Membership unlocks the collection of cheap member books."
    },
    {
      q: "How do I pay?",
      a: "Payments are processed securely by PayChangu. When you register with membership, or tap \u201CPay MWK 2,000\u201D, you are handed to PayChangu\u2019s checkout to complete the payment with your preferred method."
    },
    {
      q: "How do referrals work?",
      a: "Share your referral code from the membership page. You earn MWK 500 for each person who registers with your code, plus MWK 500 for every book your invitee buys \u2014 with no limit on the number of books."
    },
    {
      q: "When and how can I withdraw my earnings?",
      a: "Anytime. Withdrawals are made from the membership page in MWK 500 steps, and your balance updates as soon as the withdrawal is recorded."
    },
    {
      q: "How do I buy a book?",
      a: "Open the library, pick a book with a price, and tap Purchase. If your wallet balance covers it, the book is unlocked instantly; otherwise you are taken to PayChangu to pay for that book."
    },
    {
      q: "Can I get a refund?",
      a: "No \u2014 there are no refunds once a book is purchased. Please review a book before buying it."
    },
    {
      q: "Where do my purchased books live?",
      a: "In your library, marked \u201COwned\u201D. You can resume reading from any device by signing in."
    }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "FAQ", "description": "Frequently asked questions about Secondary Yaza membership, payments, and referrals." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="container" style="padding: 3rem 1.25rem 2rem; max-width: 960px;"> <div style="max-width:760px;margin:0 auto;"> <div style="margin-bottom:1.5rem;"> <h1 style="font-family:var(--font-serif);font-size:30px;line-height:1.1;margin:0 0 .75rem;">Frequently asked questions</h1> <p style="color:var(--ink-40);font-size:14px;max-width:70ch;margin:0;">Membership, payments, referrals, and reading — the essentials.</p> </div> ${faqs.map((item) => renderTemplate`<section style="border-top:1px solid var(--line); padding-top:1rem; margin-top:1rem;"> <h2 style="font-family:var(--font-serif);font-size:20px;letter-spacing:.02em;margin:0 0 .5rem;font-weight:400;">${item.q}</h2> <p style="color:var(--ink-60);font-size:16px;line-height:1.75;margin:0 0 .5rem;">${item.a}</p> </section>`)} <p style="color:var(--ink-40);font-size:14px;margin-top:2rem;">
Still stuck? Contact <a href="mailto:support@secondaryyaza.com" style="color:#2458a8;text-decoration:underline;">support@secondaryyaza.com</a> or visit <a href="/contact" style="color:#2458a8;text-decoration:underline;">contact</a>.
</p> </div> </section> ` })}`;
}, "/workspace/src/pages/faq.astro", void 0);

const $$file = "/workspace/src/pages/faq.astro";
const $$url = "/faq";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Faq,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
