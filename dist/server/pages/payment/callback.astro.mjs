import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayoutNoHeader } from '../../chunks/BaseLayoutNoHeader_UchbvdSR.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Callback = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayoutNoHeader", $$BaseLayoutNoHeader, { "title": "Payment status", "description": "Complete your Secondary Yaza payment" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", `<div class="auth-page"> <div class="auth-panel"> <div class="auth-top"> <a href="/" class="auth-logo"> <img src="/logo.svg" alt="Secondary Yaza"> </a> <div class="auth-eyebrow">PayChangu payment</div> <h1 class="auth-title" id="callback-title">Confirming your payment\u2026</h1> <p class="auth-sub" id="callback-sub">Please wait while we verify your payment with PayChangu.</p> </div> <div id="callback-status" style="font-family: var(--font-sans); font-size: 14px; padding: 1rem 1.1rem; border-radius: var(--radius-sm); background: var(--surface); border: 1px solid var(--line); margin-bottom: 1.25rem; text-align: center;">
Verifying\u2026
</div> <div id="callback-actions" style="display: none; flex-direction: column; gap: 0.75rem;"> <a href="/library" class="auth-submit" style="text-align: center; text-decoration: none;">Go to Library</a> <a href="/member-access" class="auth-switch" style="text-align: center;">View membership &amp; earnings</a> </div> <div id="retry-wrap" style="display: none; flex-direction: column; gap: 0.75rem;"> <button type="button" class="auth-submit" id="retry-btn">Check payment again</button> <a href="/register" class="auth-switch" id="retry-back" style="text-align: center;">Back to registration</a> </div> </div> </div> <script>
    (function () {
      const title = document.getElementById('callback-title');
      const sub = document.getElementById('callback-sub');
      const statusBox = document.getElementById('callback-status');
      const actions = document.getElementById('callback-actions');
      const retryWrap = document.getElementById('retry-wrap');
      const retryBtn = document.getElementById('retry-btn');

      const txRef = new URLSearchParams(window.location.search).get('tx_ref');

      // The session cookie is HttpOnly (unreadable from JS), so we cannot check
      // login state directly here. The verify endpoint accepts the cookie via
      // credentials: 'same-origin' and works for logged-out (registration) too,
      // so just default the label; it gets corrected after verification.
      document.getElementById('retry-back').textContent = 'Back to membership';
      document.getElementById('retry-back').href = '/member-access';

      function render(state, message) {
        if (state === 'paid') {
          title.textContent = 'Payment confirmed';
          sub.textContent = 'Thank you \u2014 your payment has been received.';
          statusBox.textContent = message;
          statusBox.style.color = 'var(--success)';
          statusBox.style.borderColor = 'rgba(47, 122, 77, 0.35)';
          statusBox.style.background = 'rgba(47, 122, 77, 0.08)';
          actions.style.display = 'flex';
          retryWrap.style.display = 'none';
          return;
        }

        if (state === 'pending') {
          title.textContent = 'Payment still processing';
          sub.textContent = 'PayChangu has not confirmed the payment yet.';
          statusBox.textContent = message;
          statusBox.style.color = 'var(--ink-60)';
          retryWrap.style.display = 'flex';
          return;
        }

        title.textContent = 'Payment not completed';
        sub.textContent = 'You can try the payment again whenever you are ready.';
        statusBox.textContent = message;
        statusBox.style.color = 'var(--danger)';
        statusBox.style.borderColor = 'rgba(185, 28, 28, 0.3)';
        statusBox.style.background = 'rgba(185, 28, 28, 0.06)';
        retryWrap.style.display = 'flex';
      }

      async function verify() {
        if (!txRef) {
          render('failed', 'No payment reference was provided.');
          return;
        }

        statusBox.textContent = 'Verifying\u2026';
        retryBtn.disabled = true;

        try {
          // A freshly-registered member is NOT signed in yet \u2014 their account
          // only gets a session once the payment is confirmed. The verify
          // endpoint activates that pending account using the unguessable
          // tx_ref and sets an HttpOnly cookie itself, so no Authorization
          // header is needed here; same-origin credentials send the session
          // cookie automatically for already-logged-in users.
          const res = await fetch(\`/api/payments/verify?tx_ref=\${encodeURIComponent(txRef)}\`, {
            credentials: 'same-origin',
          });
          const data = await res.json();

          if (data.success && data.status === 'paid') {
            if (data.activated) {
              // This payment completed the registration: account is live now
              // and the server already set the HttpOnly session cookie.
              window.location.href = data.redirectTo || '/library';
              return;
            }
            const isSubscription = data.paymentType === 'subscription';
            render(
              'paid',
              isSubscription
                ? 'Your membership is now active.'
                : 'Your book is now in your library.'
            );
          } else if (data.status === 'pending') {
            render('pending', data.message || 'Still processing \u2014 try again shortly.');
          } else {
            render('failed', data.message || 'The payment could not be confirmed.');
          }
        } catch (error) {
          render('pending', 'Network problem while verifying. Please try again.');
        } finally {
          retryBtn.disabled = false;
        }
      }

      retryBtn.addEventListener('click', verify);
      verify();
    })();
  <\/script> `], [" ", `<div class="auth-page"> <div class="auth-panel"> <div class="auth-top"> <a href="/" class="auth-logo"> <img src="/logo.svg" alt="Secondary Yaza"> </a> <div class="auth-eyebrow">PayChangu payment</div> <h1 class="auth-title" id="callback-title">Confirming your payment\u2026</h1> <p class="auth-sub" id="callback-sub">Please wait while we verify your payment with PayChangu.</p> </div> <div id="callback-status" style="font-family: var(--font-sans); font-size: 14px; padding: 1rem 1.1rem; border-radius: var(--radius-sm); background: var(--surface); border: 1px solid var(--line); margin-bottom: 1.25rem; text-align: center;">
Verifying\u2026
</div> <div id="callback-actions" style="display: none; flex-direction: column; gap: 0.75rem;"> <a href="/library" class="auth-submit" style="text-align: center; text-decoration: none;">Go to Library</a> <a href="/member-access" class="auth-switch" style="text-align: center;">View membership &amp; earnings</a> </div> <div id="retry-wrap" style="display: none; flex-direction: column; gap: 0.75rem;"> <button type="button" class="auth-submit" id="retry-btn">Check payment again</button> <a href="/register" class="auth-switch" id="retry-back" style="text-align: center;">Back to registration</a> </div> </div> </div> <script>
    (function () {
      const title = document.getElementById('callback-title');
      const sub = document.getElementById('callback-sub');
      const statusBox = document.getElementById('callback-status');
      const actions = document.getElementById('callback-actions');
      const retryWrap = document.getElementById('retry-wrap');
      const retryBtn = document.getElementById('retry-btn');

      const txRef = new URLSearchParams(window.location.search).get('tx_ref');

      // The session cookie is HttpOnly (unreadable from JS), so we cannot check
      // login state directly here. The verify endpoint accepts the cookie via
      // credentials: 'same-origin' and works for logged-out (registration) too,
      // so just default the label; it gets corrected after verification.
      document.getElementById('retry-back').textContent = 'Back to membership';
      document.getElementById('retry-back').href = '/member-access';

      function render(state, message) {
        if (state === 'paid') {
          title.textContent = 'Payment confirmed';
          sub.textContent = 'Thank you \u2014 your payment has been received.';
          statusBox.textContent = message;
          statusBox.style.color = 'var(--success)';
          statusBox.style.borderColor = 'rgba(47, 122, 77, 0.35)';
          statusBox.style.background = 'rgba(47, 122, 77, 0.08)';
          actions.style.display = 'flex';
          retryWrap.style.display = 'none';
          return;
        }

        if (state === 'pending') {
          title.textContent = 'Payment still processing';
          sub.textContent = 'PayChangu has not confirmed the payment yet.';
          statusBox.textContent = message;
          statusBox.style.color = 'var(--ink-60)';
          retryWrap.style.display = 'flex';
          return;
        }

        title.textContent = 'Payment not completed';
        sub.textContent = 'You can try the payment again whenever you are ready.';
        statusBox.textContent = message;
        statusBox.style.color = 'var(--danger)';
        statusBox.style.borderColor = 'rgba(185, 28, 28, 0.3)';
        statusBox.style.background = 'rgba(185, 28, 28, 0.06)';
        retryWrap.style.display = 'flex';
      }

      async function verify() {
        if (!txRef) {
          render('failed', 'No payment reference was provided.');
          return;
        }

        statusBox.textContent = 'Verifying\u2026';
        retryBtn.disabled = true;

        try {
          // A freshly-registered member is NOT signed in yet \u2014 their account
          // only gets a session once the payment is confirmed. The verify
          // endpoint activates that pending account using the unguessable
          // tx_ref and sets an HttpOnly cookie itself, so no Authorization
          // header is needed here; same-origin credentials send the session
          // cookie automatically for already-logged-in users.
          const res = await fetch(\\\`/api/payments/verify?tx_ref=\\\${encodeURIComponent(txRef)}\\\`, {
            credentials: 'same-origin',
          });
          const data = await res.json();

          if (data.success && data.status === 'paid') {
            if (data.activated) {
              // This payment completed the registration: account is live now
              // and the server already set the HttpOnly session cookie.
              window.location.href = data.redirectTo || '/library';
              return;
            }
            const isSubscription = data.paymentType === 'subscription';
            render(
              'paid',
              isSubscription
                ? 'Your membership is now active.'
                : 'Your book is now in your library.'
            );
          } else if (data.status === 'pending') {
            render('pending', data.message || 'Still processing \u2014 try again shortly.');
          } else {
            render('failed', data.message || 'The payment could not be confirmed.');
          }
        } catch (error) {
          render('pending', 'Network problem while verifying. Please try again.');
        } finally {
          retryBtn.disabled = false;
        }
      }

      retryBtn.addEventListener('click', verify);
      verify();
    })();
  <\/script> `])), maybeRenderHead()) })}`;
}, "/workspace/src/pages/payment/callback.astro", void 0);

const $$file = "/workspace/src/pages/payment/callback.astro";
const $$url = "/payment/callback";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Callback,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
