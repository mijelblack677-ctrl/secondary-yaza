import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayoutNoHeader } from '../../chunks/BaseLayoutNoHeader_UchbvdSR.mjs';
export { renderers } from '../../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayoutNoHeader", $$BaseLayoutNoHeader, { "title": "Admin Login", "description": "Access the admin panel" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-page"> <div class="auth-panel"> <div class="auth-top"> <a href="/" class="auth-logo"> <img src="/logo.svg" alt="Secondary Yaza"> </a> <div class="auth-eyebrow">Access the admin panel</div> <h1 class="auth-title">Administrator login</h1> <p class="auth-sub">Manage content, uploads, and site settings.</p> </div> <form id="admin-login-form" class="auth-form"> <div class="auth-field"> <label for="username">Username</label> <input type="text" id="username" name="username" placeholder="Enter admin username" required> </div> <div class="auth-field"> <label for="password">Password</label> <input type="password" id="password" name="password" placeholder="Enter admin password" required> </div> <div class="auth-error" id="form-error" hidden></div> <button type="submit" class="auth-submit">Sign In as Admin</button> </form> <div class="auth-switch"> <span>Back to user login</span> <a href="/login">Sign in</a> </div> </div> </div>  ` })}`;
}, "/workspace/src/pages/admin/login.astro", void 0);

const $$file = "/workspace/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
