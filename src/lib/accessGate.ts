/**
 * The one answer to "you cannot open this yet".
 *
 * The collection is members-only, so every gated surface — library, reader,
 * member area — renders this same panel: sign in if you already have an
 * account, or join for MWK 2,000. A visitor is never shown a bare error for
 * something that is simply behind membership.
 *
 * Both halves are exported so the panel can be rendered on the server (the
 * reader page decides before any content is fetched) or in the browser (the
 * library page learns about access from its own fetch).
 */

export const MEMBERSHIP_MWK = 2000;
export const MEMBERSHIP_DAYS = 30;

/** Where a signed-in non-member pays: the member page owns the payment button. */
export const JOIN_PAGE = '/member-access';

export type GateKind = 'login' | 'subscribe' | 'expired';

export interface AccessGate {
  kind: GateKind;
  title: string;
  message: string;
  /** Same-site path to come back to once signed in. */
  next: string;
}

/** Only same-site paths are ever accepted, so ?redirect=/next can't leave the site. */
export function safeNext(value: unknown, fallback = '/library'): string {
  const path = typeof value === 'string' ? value.trim() : '';
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback;
  return path;
}

export function loginHref(next: unknown): string {
  return `/login?redirect=${encodeURIComponent(safeNext(next))}`;
}

export function joinHref(next: unknown): string {
  return `/register?redirect=${encodeURIComponent(safeNext(next))}`;
}

export function makeGate(kind: GateKind, next: unknown = '/library'): AccessGate {
  const back = safeNext(next);
  const price = `MWK ${MEMBERSHIP_MWK.toLocaleString()}`;

  if (kind === 'expired') {
    return {
      kind,
      title: 'Your membership has expired',
      message: `Renew for ${price} to keep reading the collection. That covers another ${MEMBERSHIP_DAYS} days from the day you pay.`,
      next: back,
    };
  }

  if (kind === 'subscribe') {
    return {
      kind,
      title: 'Membership required',
      message: `The collection is for members. ${price} unlocks every title for ${MEMBERSHIP_DAYS} days, and you keep your referral earnings.`,
      next: back,
    };
  }

  return {
    kind: 'login',
    title: 'Sign in to continue',
    message: `The collection is for members. Sign in if you already have an account, or join for ${price} to unlock it for ${MEMBERSHIP_DAYS} days.`,
    next: back,
  };
}

/**
 * Map a gated API response onto a prompt. Returns null when the response is a
 * genuine failure (500, a book that does not exist), which stays an error.
 */
export function accessGateFromResponse(
  status: number,
  data: unknown,
  next: unknown = '/library'
): AccessGate | null {
  const code = String((data as { code?: unknown } | null)?.code ?? '');
  if (code === 'subscription_expired') return makeGate('expired', next);
  if (code === 'subscription_required') return makeGate('subscribe', next);
  if (code === 'login_required' || status === 401) return makeGate('login', next);
  return null;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface RenderOptions {
  /** The site icon set (`icons` from lib/icons). */
  icons?: Record<string, string>;
  /** When set, a visitor who cannot read yet is offered their way back. */
  backHref?: string;
  backLabel?: string;
}

/** The panel itself, as HTML. Safe to inject with `set:html` or `innerHTML`. */
export function renderAccessGate(gate: AccessGate, opts: RenderOptions = {}): string {
  const price = `MWK ${MEMBERSHIP_MWK.toLocaleString()}`;
  const iconName = gate.kind === 'login' ? 'lock' : gate.kind === 'expired' ? 'alert' : 'star';
  const glyph = opts.icons?.[iconName] || opts.icons?.lock || '';

  const buttons: string[] = [];
  if (gate.kind === 'login') {
    buttons.push(
      `<a class="btn btn-primary" href="${escapeHtml(loginHref(gate.next))}" style="text-decoration: none;">Sign in</a>`,
      `<a class="btn btn-outline" href="${escapeHtml(joinHref(gate.next))}" style="text-decoration: none;">Join for ${price}</a>`
    );
  } else if (gate.kind === 'expired') {
    buttons.push(
      `<a class="btn btn-primary" href="${escapeHtml(JOIN_PAGE)}" style="text-decoration: none;">Renew for ${price}</a>`
    );
  } else {
    buttons.push(
      `<a class="btn btn-primary" href="${escapeHtml(JOIN_PAGE)}" style="text-decoration: none;">Pay ${price}</a>`
    );
  }

  if (opts.backHref) {
    buttons.push(
      `<a class="btn btn-outline" href="${escapeHtml(opts.backHref)}" style="text-decoration: none;">${escapeHtml(opts.backLabel || 'Go back')}</a>`
    );
  }

  return `
    <div class="access-gate" style="max-width: 620px; margin: 0 auto; padding: 2.5rem 1.5rem; text-align: center; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg);">
      ${glyph ? `<div class="icon" style="margin-bottom: 0.85rem;">${glyph}</div>` : ''}
      <h2 style="font-family: var(--font-serif-display); font-weight: 300; margin-bottom: 0.6rem;">${escapeHtml(gate.title)}</h2>
      <p style="max-width: 46ch; margin: 0 auto 1.4rem; color: var(--ink-60); font-size: 15px; line-height: 1.65;">${escapeHtml(gate.message)}</p>
      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center;">${buttons.join('')}</div>
      <p style="margin: 1.2rem auto 0; max-width: 44ch; font-size: 12.5px; line-height: 1.6; color: var(--ink-40);">
        Payment is handled securely by PayChangu. Membership simply lapses when it ends — nothing renews on its own.
      </p>
    </div>
  `;
}
