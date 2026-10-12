import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_njTcWfK9.mjs';
import { i as icons } from '../chunks/icons_DHD92_qN.mjs';
export { renderers } from '../renderers.mjs';

const $$Logout = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Logging Out" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="display: flex; align-items: center; justify-content: center; min-height: 60vh;"> <div style="text-align: center;"> <div class="icon-big">${unescapeHTML(icons.wave)}</div> <h1>Logging Out</h1> <p class="text-muted">You are being signed out of your account...</p> </div> </div>  ` })}`;
}, "/workspace/src/pages/logout.astro", void 0);

const $$file = "/workspace/src/pages/logout.astro";
const $$url = "/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Logout,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
