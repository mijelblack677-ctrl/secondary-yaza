import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayoutNoHeader } from '../chunks/BaseLayoutNoHeader_UchbvdSR.mjs';
export { renderers } from '../renderers.mjs';

const $$Register = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayoutNoHeader", $$BaseLayoutNoHeader, { "title": "Register", "description": "Create your Secondary Yaza account" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-page"> <div class="auth-panel"> <div class="auth-top"> <a href="/" class="auth-logo"> <img src="/logo.svg" alt="Secondary Yaza"> </a> <div class="auth-eyebrow">Join Secondary Yaza today</div> <h1 class="auth-title">Create your account</h1> <p class="auth-sub">Save books, pick up where you left off, and read anywhere.</p> </div> <form id="register-form" class="auth-form"> <div class="auth-field"> <label class="auth-check"> <input type="checkbox" id="policies-check" required> <span>I agree to the <a href="/policies" target="_blank" rel="noopener">Terms of Service</a> and <a href="/policies" target="_blank" rel="noopener">Privacy Policy</a>.</span> </label> </div> <div class="auth-field"> <label for="referralCode" style="font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.06em; color: var(--ink);">Referral code (optional)</label> <input type="text" id="referralCode" name="referralCode" autocomplete="off" placeholder="Enter a friend's code to earn MWK 500" style="font-family: var(--font-sans); font-size: 16px; color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong); border-radius: var(--radius-sm); padding: 0.75rem 0.85rem;"> </div> <div class="auth-field"> <label for="fullName">Full name</label> <input type="text" id="fullName" name="fullName" autocomplete="name" placeholder="Enter your full name" required> </div> <div class="auth-field"> <label for="email">Email address</label> <input type="email" id="email" name="email" autocomplete="email" placeholder="you@example.com" required> </div> <div class="auth-field"> <label for="phone">Phone number</label> <input type="tel" id="phone" name="phone" autocomplete="tel" placeholder="+265 991 234 567" required> </div> <div class="auth-field"> <label for="password">Password</label> <input type="password" id="password" name="password" autocomplete="new-password" placeholder="Create a strong password" required minlength="8"> <div class="auth-hint">Minimum 8 characters</div> </div> <div class="auth-field"> <label for="confirmPassword">Confirm password</label> <input type="password" id="confirmPassword" name="confirmPassword" autocomplete="new-password" placeholder="Confirm your password" required> </div> <div class="auth-field" style="border-top: 1px solid var(--line); padding-top: 1rem;"> <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); margin-bottom: 0.4rem;">Membership</p> <p style="font-size: 13px; color: var(--ink-60); line-height: 1.55;">
Registration is completed with a membership fee of <strong>MWK 2,000</strong>, paid securely through PayChangu.
            Your account is created and activated <strong>only after the payment is confirmed</strong> — until then nothing is charged to you beyond the fee itself and no account exists.
            The membership unlocks the collection of cheap books for 30 days. There is no refund once a book is purchased.
</p> </div> <div class="auth-error" id="form-error" hidden></div> <button type="submit" class="auth-submit">Create account &amp; pay MWK 2,000</button> <div class="auth-switch"> <span>Already have an account?</span> <a href="/login">Sign in</a> </div> </form> </div> </div>  ` })}`;
}, "/workspace/src/pages/register.astro", void 0);

const $$file = "/workspace/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
