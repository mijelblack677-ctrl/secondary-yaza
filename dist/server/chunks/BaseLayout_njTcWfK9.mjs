import { c as createComponent, r as renderTemplate, f as renderSlot, g as renderHead, a as addAttribute, b as createAstro } from './astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, description = "Secondary Yaza - Your Premier Digital Library" } = Astro2.props;
  return renderTemplate(_a || (_a = __template([`<script>
  /** @type {any} */
  const _u = window._yb_url || (window._yb_url = {});
  _u['/'] = 'Home';
  _u['/library'] = 'Library';
  _u['/about'] = 'About';
  _u['/contact'] = 'Contact';
  _u['/member-access'] = 'Member Access';
<\/script> <html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="description"`, '><meta name="theme-color" content="#F9F5F0"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>', ' | Secondary Yaza</title><link rel="icon" type="image/svg+xml" href="/logo.svg"><link rel="apple-touch-icon" href="/logo.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">', '</head> <body> <header class="site-header"> <div class="site-header-inner"> <a href="/" class="site-logo" aria-label="Secondary Yaza home"> <img src="/logo.svg" alt="Secondary Yaza"> </a> <nav class="site-nav" id="site-nav"> <a href="/">Home</a> <a href="/library">Library</a> <a href="/about">About</a> <a href="/contact">Contact</a> <a href="/member-access">Member Access</a> </nav> <button class="menu-toggle" aria-label="Toggle menu" aria-controls="site-nav-panel" aria-expanded="false"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"> <line x1="3" y1="7" x2="21" y2="7"></line> <line x1="3" y1="12" x2="21" y2="12"></line> <line x1="3" y1="17" x2="21" y2="17"></line> </svg> </button> </div> </header> <div id="site-overlay" class="site-overlay"></div> <div id="site-backdrop" class="site-backdrop"></div> <div id="site-nav-panel" class="site-nav-panel" aria-hidden="true"> <div class="site-nav-panel-inner"> <a href="/" class="site-nav-panel-link btn-gold" data-nav-url="/">Home</a> <a href="/library" class="site-nav-panel-link" data-nav-url="/library">Library</a> <a href="/about" class="site-nav-panel-link" data-nav-url="/about">About</a> <a href="/contact" class="site-nav-panel-link" data-nav-url="/contact">Contact</a> <a href="/member-access" class="site-nav-panel-link btn-gold" data-nav-url="/member-access">Member Access</a> </div> </div> <main class="site-main"> ', ' </main> <footer class="site-footer"> <div class="footer-content"> <div class="footer-brand"> <h4>Secondary Yaza</h4> <p>A modern digital library bringing quality books and educational content to readers everywhere.</p> </div> <div> <h4>Library</h4> <a href="/library">Browse Collection</a> <a href="/about">About Us</a> <a href="/contact">Contact</a> </div> <div> <h4>Support</h4> <a href="/faq">FAQ</a> <a href="/terms">Terms of Service</a> <a href="/privacy">Privacy Policy</a> </div> </div> <div class="footer-bottom"> <p>&copy; ', " Secondary Yaza. All rights reserved.</p> </div> </footer>  </body> </html>"])), addAttribute(description, "content"), title, renderHead(), renderSlot($$result, $$slots["default"]), (/* @__PURE__ */ new Date()).getFullYear());
}, "/workspace/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
