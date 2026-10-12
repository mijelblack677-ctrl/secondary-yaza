import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, e as defineScriptVars, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_YYywBuIZ.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_njTcWfK9.mjs';
import { i as icons } from '../chunks/icons_DHD92_qN.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$MemberAccess = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MemberAccess;
  const { title, description = "Member Access \u2014 read the membership collection" } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<section class="container" style="padding: 3rem var(--page-x) 1.5rem; max-width: 1080px;"> <div style="text-align: center; margin-bottom: 2.25rem;"> <span class="badge" style="display: inline-block; margin-bottom: 1rem;">Member Access</span> <h1 style="margin-bottom: 0.5rem;">Your membership</h1> <p class="text-muted" style="max-width: 560px; margin: 0.5rem auto 0; font-family: var(--font-body); font-size: 17px;">\nMembers pay MWK 2,000 to unlock the cheap membership collection. Use the referral code you were given to invite friends \u2014 each\n        successful registration earns you MWK 500, and each book your invitee buys earns you another MWK 500.\n</p> </div> <div id="loading" class="loading"> <div class="spinner"></div> <p class="text-muted">Loading your membership\u2026</p> </div> <div id="member-panel" style="display: none;"> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.75rem;"> <div class="book-card" style="flex-direction: column; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden;"> <div class="book-cover" style="position: relative; aspect-ratio: 3/4; background: linear-gradient(160deg, var(--accent) 0%, var(--surface-2) 100%); display: flex; align-items: center; justify-content: center; overflow: hidden;"> <span class="book-cover-icon" style="font-size: 2.25rem; opacity: 0.75;">', '</span> </div> <div class="book-info" style="padding: 1rem 1.1rem 1.25rem; display: flex; flex-direction: column; flex: 1;"> <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">Membership</h3> <p class="author" style="font-family: var(--font-sans); font-size: 12px; color: var(--ink-40); margin-bottom: 0.6rem;">Member subscription</p> <div class="book-meta" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--line);"> <span class="book-price" style="font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--ink);">MWK 2,000 / month</span> <span class="book-status" style="font-family: var(--font-sans); font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.25rem 0.55rem; border-radius: var(--radius-pill); background: rgba(47, 122, 77, 0.12); color: var(--success);" id="member-status">Not a member yet</span> </div> </div> </div> <div style="display: flex; flex-direction: column; gap: 1rem;"> <div style="background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 1.25rem;"> <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 0.6rem;">Referral balance</p> <p style="font-family: var(--font-display); font-weight: 300; font-size: 2rem; line-height: 1; margin-bottom: 0.25rem;" id="referral-balance">MWK 0</p> <p style="font-size: 12px; color: var(--ink-40);">Earned from referrals and book purchases.</p> </div> <div style="background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 1.25rem;"> <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 0.6rem;">Active referrals</p> <p id="referral-count" style="font-family: var(--font-display); font-weight: 300; font-size: 2rem; line-height: 1; margin-bottom: 0.25rem;">0</p> <p style="font-size: 12px; color: var(--ink-40);">People who registered using your code.</p> </div> </div> </div> <div id="join-wrap" style="display: none; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 1.75rem; margin-bottom: 1.75rem; text-align: center;"> <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Become a member</h2> <p class="text-muted" style="font-size: 14px; margin: 0 auto 1rem; max-width: 520px;">\nPay the MWK 2,000 subscription fee to unlock the membership collection of cheap books.\n          Payment is processed securely by PayChangu.\n</p> <button type="button" class="auth-submit" id="join-btn" style="max-width: 320px; margin: 0 auto;">Pay MWK 2,000</button> <p class="auth-error" id="join-error" hidden style="background: rgba(185, 28, 28, 0.08); color: var(--danger); border: 1px solid rgba(185, 28, 28, 0.2); border-radius: var(--radius-sm); padding: 0.7rem 0.85rem; font-family: var(--font-sans); font-size: 13px; margin-top: 1rem;"></p> </div> <form id="withdraw-form" style="background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.05rem;"> <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Withdraw your earnings</h2> <p class="text-muted" style="font-size: 14px; margin: 0 0 1rem;">\nWithdrawals are paid to your wallet. Earn MWK 500 per invited registrant and MWK 500 per book your invitee buys \u2014 withdraw anytime.\n</p> <div class="auth-field" style="display: flex; flex-direction: column; gap: 0.4rem;"> <label for="withdraw-amount" style="font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.06em; color: var(--ink);">Amount to withdraw (MWK)</label> <input type="number" id="withdraw-amount" min="500" step="500" placeholder="e.g. 500" autocomplete="off" style="font-family: var(--font-sans); font-size: 16px; color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong); border-radius: var(--radius-sm); padding: 0.75rem 0.85rem;"> </div> <button type="submit" class="auth-submit" id="withdraw-btn">Withdraw MWK</button> <p class="auth-error" id="withdraw-error" hidden style="background: rgba(185, 28, 28, 0.08); color: var(--danger); border: 1px solid rgba(185, 28, 28, 0.2); border-radius: var(--radius-sm); padding: 0.7rem 0.85rem; font-family: var(--font-sans); font-size: 13px;"></p> </form> <div id="withdraw-status" style="font-size: 13px; color: var(--success); display: none;"></div> </div> </section> <script>(function(){', `
    const ICONS = icons;
    (async () => {
      // Auth is carried by the HttpOnly session cookie; client never reads tokens.
      const loading = document.getElementById('loading');
      const memberPanel = document.getElementById('member-panel');
      const memberStatus = document.getElementById('member-status');
      const referralBalance = document.getElementById('referral-balance');
      const referralCount = document.getElementById('referral-count');
      const withdrawForm = document.getElementById('withdraw-form');
      const withdrawBtn = document.getElementById('withdraw-btn');
      const withdrawError = document.getElementById('withdraw-error');
      const withdrawStatus = document.getElementById('withdraw-status');

      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        const data = await res.json();

        if (!data.success) {
          memberPanel.innerHTML = \`
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px solid var(--line);">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">\${ICONS.alert}</div>
              <h2 style="margin-bottom: 0.5rem; font-family: var(--font-serif-display); font-weight: 300;">Unable to load account</h2>
              <p style="color: var(--ink-60); font-size: 0.9375rem; margin-bottom: 1rem;">\${escapeHtml(data.message || 'Please try again.')}</p>
              <a href="/logout" class="btn-gold">Sign out</a>
            </div>
          \`;
          memberPanel.style.display = 'block';
          return;
        }

        const user = data.user;
        const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
        const activeMember = Boolean(user.isSubscribed) && (!expiresAt || expiresAt.getTime() > Date.now());
        memberStatus.textContent = activeMember ? 'Member' : (user.isSubscribed ? 'Membership expired' : 'Not a member yet');
        memberStatus.className = 'book-status ' + (activeMember ? 'owned' : 'available');
        referralBalance.textContent = 'MWK ' + (parseFloat(user.walletBalance || '0') || 0).toLocaleString();
        referralCount.textContent = user.referralCount ?? 0;

        if (activeMember) {
          const now = new Date();
          const expires = expiresAt || now;
          const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          memberPanel.querySelector('.text-muted')?.remove();
          const p = document.createElement('p');
          p.className = 'text-muted';
          p.style.fontSize = '14px';
          p.style.margin = '0.5rem auto 0';
          p.style.maxWidth = '560px';
          p.style.fontFamily = 'var(--font-body)';
          p.textContent = \`Your membership is active until \${expires.toLocaleDateString()}.\`;
          memberPanel.prepend(p);
        }

        memberPanel.style.display = 'block';
        loading.style.display = 'none';

        // Membership payable via PayChangu when not (or no longer) active.
        const joinWrap = document.getElementById('join-wrap');
        const joinBtn = document.getElementById('join-btn');
        const joinError = document.getElementById('join-error');
        if (!activeMember && joinWrap && joinBtn) {
          joinWrap.style.display = 'block';
          joinBtn.addEventListener('click', async () => {
            joinError.hidden = true;
            joinBtn.disabled = true;
            joinBtn.textContent = 'Starting payment\u2026';
            try {
              const res = await fetch('/api/payments/create', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'subscription' })
              });
              const result = await res.json();
              if (result.success && result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
                return;
              }
              joinError.textContent = result.message || 'Could not start the payment. Please try again.';
              joinError.hidden = false;
            } catch (error) {
              joinError.textContent = 'Network error. Please try again.';
              joinError.hidden = false;
            } finally {
              joinBtn.disabled = false;
              joinBtn.textContent = 'Pay MWK 2,000';
            }
          });
        }

        if (withdrawForm) {
          withdrawForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            withdrawError.hidden = true;
            withdrawStatus.style.display = 'none';

            const amount = parseInt(document.getElementById('withdraw-amount')?.value || '0', 10);
            if (!amount || amount < 500 || amount % 500 !== 0) {
              withdrawError.textContent = 'Enter a valid amount (MWK 500 minimum, in 500 steps).';
              withdrawError.hidden = false;
              return;
            }

            withdrawBtn.disabled = true;
            withdrawBtn.textContent = 'Processing\u2026';

            try {
              const res = await fetch('/api/auth/withdraw', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
              });
              const result = await res.json();
              if (result.success) {
                withdrawStatus.textContent = result.message;
                withdrawStatus.style.display = 'block';
                withdrawForm.reset();
              } else {
                withdrawError.textContent = result.message || 'Withdrawal failed';
                withdrawError.hidden = false;
              }
            } catch (error) {
              withdrawError.textContent = 'Withdrawal failed. Please try again.';
              withdrawError.hidden = false;
            } finally {
              withdrawBtn.disabled = false;
              withdrawBtn.textContent = 'Withdraw MWK';
            }
          });
        }
      } catch (error) {
        console.error('Member access load error:', error);
        loading.style.display = 'none';
        memberPanel.innerHTML = \`
          <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px solid var(--line);">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">\${ICONS.alert}</div>
            <h2 style="margin-bottom: 0.5rem; font-family: var(--font-serif-display); font-weight: 300;">Something went wrong</h2>
            <p style="color: var(--ink-60); font-size: 0.9375rem; margin-bottom: 1rem;">Please refresh the page and try again.</p>
            <a href="/library" class="btn-gold">Back to Library</a>
          </div>
        \`;
        memberPanel.style.display = 'block';
      }
    })();

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  })();<\/script> `], [" ", '<section class="container" style="padding: 3rem var(--page-x) 1.5rem; max-width: 1080px;"> <div style="text-align: center; margin-bottom: 2.25rem;"> <span class="badge" style="display: inline-block; margin-bottom: 1rem;">Member Access</span> <h1 style="margin-bottom: 0.5rem;">Your membership</h1> <p class="text-muted" style="max-width: 560px; margin: 0.5rem auto 0; font-family: var(--font-body); font-size: 17px;">\nMembers pay MWK 2,000 to unlock the cheap membership collection. Use the referral code you were given to invite friends \u2014 each\n        successful registration earns you MWK 500, and each book your invitee buys earns you another MWK 500.\n</p> </div> <div id="loading" class="loading"> <div class="spinner"></div> <p class="text-muted">Loading your membership\u2026</p> </div> <div id="member-panel" style="display: none;"> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.75rem;"> <div class="book-card" style="flex-direction: column; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden;"> <div class="book-cover" style="position: relative; aspect-ratio: 3/4; background: linear-gradient(160deg, var(--accent) 0%, var(--surface-2) 100%); display: flex; align-items: center; justify-content: center; overflow: hidden;"> <span class="book-cover-icon" style="font-size: 2.25rem; opacity: 0.75;">', '</span> </div> <div class="book-info" style="padding: 1rem 1.1rem 1.25rem; display: flex; flex-direction: column; flex: 1;"> <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">Membership</h3> <p class="author" style="font-family: var(--font-sans); font-size: 12px; color: var(--ink-40); margin-bottom: 0.6rem;">Member subscription</p> <div class="book-meta" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--line);"> <span class="book-price" style="font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--ink);">MWK 2,000 / month</span> <span class="book-status" style="font-family: var(--font-sans); font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.25rem 0.55rem; border-radius: var(--radius-pill); background: rgba(47, 122, 77, 0.12); color: var(--success);" id="member-status">Not a member yet</span> </div> </div> </div> <div style="display: flex; flex-direction: column; gap: 1rem;"> <div style="background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 1.25rem;"> <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 0.6rem;">Referral balance</p> <p style="font-family: var(--font-display); font-weight: 300; font-size: 2rem; line-height: 1; margin-bottom: 0.25rem;" id="referral-balance">MWK 0</p> <p style="font-size: 12px; color: var(--ink-40);">Earned from referrals and book purchases.</p> </div> <div style="background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 1.25rem;"> <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 0.6rem;">Active referrals</p> <p id="referral-count" style="font-family: var(--font-display); font-weight: 300; font-size: 2rem; line-height: 1; margin-bottom: 0.25rem;">0</p> <p style="font-size: 12px; color: var(--ink-40);">People who registered using your code.</p> </div> </div> </div> <div id="join-wrap" style="display: none; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 1.75rem; margin-bottom: 1.75rem; text-align: center;"> <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Become a member</h2> <p class="text-muted" style="font-size: 14px; margin: 0 auto 1rem; max-width: 520px;">\nPay the MWK 2,000 subscription fee to unlock the membership collection of cheap books.\n          Payment is processed securely by PayChangu.\n</p> <button type="button" class="auth-submit" id="join-btn" style="max-width: 320px; margin: 0 auto;">Pay MWK 2,000</button> <p class="auth-error" id="join-error" hidden style="background: rgba(185, 28, 28, 0.08); color: var(--danger); border: 1px solid rgba(185, 28, 28, 0.2); border-radius: var(--radius-sm); padding: 0.7rem 0.85rem; font-family: var(--font-sans); font-size: 13px; margin-top: 1rem;"></p> </div> <form id="withdraw-form" style="background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.05rem;"> <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Withdraw your earnings</h2> <p class="text-muted" style="font-size: 14px; margin: 0 0 1rem;">\nWithdrawals are paid to your wallet. Earn MWK 500 per invited registrant and MWK 500 per book your invitee buys \u2014 withdraw anytime.\n</p> <div class="auth-field" style="display: flex; flex-direction: column; gap: 0.4rem;"> <label for="withdraw-amount" style="font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.06em; color: var(--ink);">Amount to withdraw (MWK)</label> <input type="number" id="withdraw-amount" min="500" step="500" placeholder="e.g. 500" autocomplete="off" style="font-family: var(--font-sans); font-size: 16px; color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong); border-radius: var(--radius-sm); padding: 0.75rem 0.85rem;"> </div> <button type="submit" class="auth-submit" id="withdraw-btn">Withdraw MWK</button> <p class="auth-error" id="withdraw-error" hidden style="background: rgba(185, 28, 28, 0.08); color: var(--danger); border: 1px solid rgba(185, 28, 28, 0.2); border-radius: var(--radius-sm); padding: 0.7rem 0.85rem; font-family: var(--font-sans); font-size: 13px;"></p> </form> <div id="withdraw-status" style="font-size: 13px; color: var(--success); display: none;"></div> </div> </section> <script>(function(){', `
    const ICONS = icons;
    (async () => {
      // Auth is carried by the HttpOnly session cookie; client never reads tokens.
      const loading = document.getElementById('loading');
      const memberPanel = document.getElementById('member-panel');
      const memberStatus = document.getElementById('member-status');
      const referralBalance = document.getElementById('referral-balance');
      const referralCount = document.getElementById('referral-count');
      const withdrawForm = document.getElementById('withdraw-form');
      const withdrawBtn = document.getElementById('withdraw-btn');
      const withdrawError = document.getElementById('withdraw-error');
      const withdrawStatus = document.getElementById('withdraw-status');

      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        const data = await res.json();

        if (!data.success) {
          memberPanel.innerHTML = \\\`
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px solid var(--line);">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">\\\${ICONS.alert}</div>
              <h2 style="margin-bottom: 0.5rem; font-family: var(--font-serif-display); font-weight: 300;">Unable to load account</h2>
              <p style="color: var(--ink-60); font-size: 0.9375rem; margin-bottom: 1rem;">\\\${escapeHtml(data.message || 'Please try again.')}</p>
              <a href="/logout" class="btn-gold">Sign out</a>
            </div>
          \\\`;
          memberPanel.style.display = 'block';
          return;
        }

        const user = data.user;
        const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
        const activeMember = Boolean(user.isSubscribed) && (!expiresAt || expiresAt.getTime() > Date.now());
        memberStatus.textContent = activeMember ? 'Member' : (user.isSubscribed ? 'Membership expired' : 'Not a member yet');
        memberStatus.className = 'book-status ' + (activeMember ? 'owned' : 'available');
        referralBalance.textContent = 'MWK ' + (parseFloat(user.walletBalance || '0') || 0).toLocaleString();
        referralCount.textContent = user.referralCount ?? 0;

        if (activeMember) {
          const now = new Date();
          const expires = expiresAt || now;
          const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          memberPanel.querySelector('.text-muted')?.remove();
          const p = document.createElement('p');
          p.className = 'text-muted';
          p.style.fontSize = '14px';
          p.style.margin = '0.5rem auto 0';
          p.style.maxWidth = '560px';
          p.style.fontFamily = 'var(--font-body)';
          p.textContent = \\\`Your membership is active until \\\${expires.toLocaleDateString()}.\\\`;
          memberPanel.prepend(p);
        }

        memberPanel.style.display = 'block';
        loading.style.display = 'none';

        // Membership payable via PayChangu when not (or no longer) active.
        const joinWrap = document.getElementById('join-wrap');
        const joinBtn = document.getElementById('join-btn');
        const joinError = document.getElementById('join-error');
        if (!activeMember && joinWrap && joinBtn) {
          joinWrap.style.display = 'block';
          joinBtn.addEventListener('click', async () => {
            joinError.hidden = true;
            joinBtn.disabled = true;
            joinBtn.textContent = 'Starting payment\u2026';
            try {
              const res = await fetch('/api/payments/create', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'subscription' })
              });
              const result = await res.json();
              if (result.success && result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
                return;
              }
              joinError.textContent = result.message || 'Could not start the payment. Please try again.';
              joinError.hidden = false;
            } catch (error) {
              joinError.textContent = 'Network error. Please try again.';
              joinError.hidden = false;
            } finally {
              joinBtn.disabled = false;
              joinBtn.textContent = 'Pay MWK 2,000';
            }
          });
        }

        if (withdrawForm) {
          withdrawForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            withdrawError.hidden = true;
            withdrawStatus.style.display = 'none';

            const amount = parseInt(document.getElementById('withdraw-amount')?.value || '0', 10);
            if (!amount || amount < 500 || amount % 500 !== 0) {
              withdrawError.textContent = 'Enter a valid amount (MWK 500 minimum, in 500 steps).';
              withdrawError.hidden = false;
              return;
            }

            withdrawBtn.disabled = true;
            withdrawBtn.textContent = 'Processing\u2026';

            try {
              const res = await fetch('/api/auth/withdraw', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
              });
              const result = await res.json();
              if (result.success) {
                withdrawStatus.textContent = result.message;
                withdrawStatus.style.display = 'block';
                withdrawForm.reset();
              } else {
                withdrawError.textContent = result.message || 'Withdrawal failed';
                withdrawError.hidden = false;
              }
            } catch (error) {
              withdrawError.textContent = 'Withdrawal failed. Please try again.';
              withdrawError.hidden = false;
            } finally {
              withdrawBtn.disabled = false;
              withdrawBtn.textContent = 'Withdraw MWK';
            }
          });
        }
      } catch (error) {
        console.error('Member access load error:', error);
        loading.style.display = 'none';
        memberPanel.innerHTML = \\\`
          <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px solid var(--line);">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">\\\${ICONS.alert}</div>
            <h2 style="margin-bottom: 0.5rem; font-family: var(--font-serif-display); font-weight: 300;">Something went wrong</h2>
            <p style="color: var(--ink-60); font-size: 0.9375rem; margin-bottom: 1rem;">Please refresh the page and try again.</p>
            <a href="/library" class="btn-gold">Back to Library</a>
          </div>
        \\\`;
        memberPanel.style.display = 'block';
      }
    })();

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  })();<\/script> `])), maybeRenderHead(), unescapeHTML(icons.card), defineScriptVars({ icons })) })}`;
}, "/workspace/src/pages/member-access.astro", void 0);

const $$file = "/workspace/src/pages/member-access.astro";
const $$url = "/member-access";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$MemberAccess,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
