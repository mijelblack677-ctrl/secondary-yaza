import { c as createComponent, a as addAttribute, g as renderHead, f as renderSlot, r as renderTemplate, b as createAstro } from './astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$BaseLayoutNoHeader = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayoutNoHeader;
  const { title, description = "Secondary Yaza" } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="description"${addAttribute(description, "content")}><meta name="theme-color" content="#F9F5F0"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>${title} | Secondary Yaza</title><link rel="icon" type="image/svg+xml" href="/logo.svg"><link rel="apple-touch-icon" href="/logo.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">${renderHead()}</head> <body> <main class="site-main"> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/workspace/src/layouts/BaseLayoutNoHeader.astro", void 0);

export { $$BaseLayoutNoHeader as $ };
