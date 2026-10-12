import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayoutNoHeader } from '../chunks/BaseLayoutNoHeader_UchbvdSR.mjs';
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayoutNoHeader", $$BaseLayoutNoHeader, { "title": "Login", "description": "Sign in to your Secondary Yaza account" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-page"> <div class="auth-panel"> <div class="auth-top"> <a href="/" class="auth-logo"> <img src="/logo.svg" alt="Secondary Yaza"> </a> <div class="auth-eyebrow">Sign in to your account</div> <h1 class="auth-title">Welcome back</h1> <p class="auth-sub">Get back to your library, saved reads, and notes.</p> </div> <form id="login-form" class="auth-form"> <div class="auth-field"> <label for="email">Email address</label> <input type="email" id="email" name="email" autocomplete="email" placeholder="you@example.com" required> </div> <div class="auth-field"> <label for="password">Password</label> <input type="password" id="password" name="password" autocomplete="current-password" placeholder="Enter your password" required> </div> <div class="auth-error" id="form-error" hidden></div> <button type="submit" class="auth-submit">Sign In</button> </form> <div class="auth-switch"> <span>Don't have an account?</span> <a href="/register">Create one</a> </div> </div> </div>  ` })}`;
}, "/workspace/src/pages/login.astro", void 0);

const $$file = "/workspace/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
