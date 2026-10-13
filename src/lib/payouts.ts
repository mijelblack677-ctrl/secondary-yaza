/**
 * Member withdrawals — the mobile-money payout rail.
 *
 * Money leaves the business's PayChangu balance and lands on a member's phone,
 * so this module is deliberately conservative:
 *
 *  - the wallet is debited BEFORE the gateway is called (a reservation), never
 *    after, so a member can never withdraw faster than we can record it;
 *  - every payout carries an unguessable `charge_id` that doubles as the
 *    gateway's idempotency key, so a retry cannot pay twice;
 *  - if the gateway refuses the transfer, or later reports it failed, the
 *    reservation is reversed and the member is credited back — exactly once,
 *    guarded by a status flip inside a transaction.
 */

import { db } from './db';
import { wallets, transactions, notifications, payouts } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Overridable so staging/tests can point at a mock gateway.
const PAYCHANGU_API = process.env.PAYCHANGU_API_BASE || 'https://api.paychangu.com';
const SECRET_KEY = process.env.PAYCHANGU_SECRET_KEY || '';

/** What we skim off every withdrawal. The member receives gross - fee. */
export const WITHDRAWAL_FEE_RATE = 0.16;

/** Smallest amount a member may request, and the increments they may request in. */
export const MIN_WITHDRAWAL_MWK = 500;
export const WITHDRAWAL_STEP_MWK = 500;

export interface WithdrawalBreakdown {
  gross: number;
  fee: number;
  net: number;
}

/** Split a requested amount into the fee we keep and the money we send out. */
export function computeWithdrawal(gross: number): WithdrawalBreakdown {
  const fee = Math.round(gross * WITHDRAWAL_FEE_RATE * 100) / 100;
  const net = Math.round((gross - fee) * 100) / 100;
  return { gross, fee, net };
}

export interface AmountCheck {
  ok: boolean;
  message?: string;
}

/** Validate a requested withdrawal amount against the wallet rules. */
export function validateWithdrawalAmount(raw: unknown): AmountCheck & { amount: number } {
  const parsed =
    typeof raw === 'number' ? raw : parseInt(String(raw ?? '').trim() || '0', 10);
  const amount = Number.isFinite(parsed) ? Math.floor(parsed) : 0;

  if (amount < MIN_WITHDRAWAL_MWK) {
    return { ok: false, amount, message: `Minimum withdrawal is MWK ${MIN_WITHDRAWAL_MWK}.` };
  }
  if (amount % WITHDRAWAL_STEP_MWK !== 0) {
    return {
      ok: false,
      amount,
      message: `Withdraw in multiples of MWK ${WITHDRAWAL_STEP_MWK}.`,
    };
  }
  return { ok: true, amount };
}

/* ------------------------------------------------------------------ *
 * Phone numbers and operators
 * ------------------------------------------------------------------ */

/**
 * Normalise a Malawian mobile number to `+265XXXXXXXXX`.
 *
 * Accepts `+265991234567`, `265991234567`, `0991234567` and `991234567`.
 * Returns null for anything that is not a Malawian mobile number — we would
 * rather refuse a withdrawal than send money to a number we cannot vouch for.
 */
export function normalizeMalawiPhone(input: unknown): string | null {
  const digits = String(input ?? '').replace(/\D/g, '');

  let local: string | null = null;
  if (digits.length === 12 && digits.startsWith('265')) {
    local = digits.slice(3);
  } else if (digits.length === 10 && digits.startsWith('0')) {
    local = digits.slice(1);
  } else if (digits.length === 9) {
    local = digits;
  }

  // Malawian mobiles are 9 digits starting 8 (TNM) or 9 (Airtel).
  if (!local || !/^[89]\d{8}$/.test(local)) return null;
  return `+265${local}`;
}

/**
 * The wire format PayChangu documents for a payout (their sample request body
 * sends `0990000000`), i.e. the local form with a leading zero.
 */
export function toGatewayMobile(normalized: string): string {
  return `0${normalized.replace(/^\+265/, '')}`;
}

/** Which network owns a normalised number: 'tnm' | 'airtel' | null. */
export function operatorCodeForPhone(normalized: string): 'tnm' | 'airtel' | null {
  const local = normalized.replace(/^\+265/, '');
  const prefix = local.slice(0, 2);
  if (prefix === '88' || prefix === '89') return 'tnm';
  if (prefix === '98' || prefix === '99') return 'airtel';
  return null;
}

export interface MomoOperator {
  name: string;
  refId: string;
  shortCode: string;
  supportsWithdrawals: boolean;
}

/** Fallback if PayChangu's operator list cannot be reached. */
const OPERATOR_FALLBACK: Record<'tnm' | 'airtel', MomoOperator> = {
  tnm: {
    name: 'TNM Mpamba',
    refId: '27494cb5-ba9e-437f-a114-4e7a7686bcca',
    shortCode: 'tnm',
    supportsWithdrawals: true,
  },
  airtel: {
    name: 'Airtel Money',
    refId: '20be6c20-adeb-4b5b-a7ba-0769820df4fb',
    shortCode: 'airtel',
    supportsWithdrawals: true,
  },
};

let operatorCache: { at: number; list: MomoOperator[] } | null = null;
const OPERATOR_TTL_MS = 10 * 60 * 1000;

/** The payout operators PayChangu currently supports (cached briefly). */
export async function getOperators(): Promise<MomoOperator[]> {
  if (operatorCache && Date.now() - operatorCache.at < OPERATOR_TTL_MS) {
    return operatorCache.list;
  }

  try {
    const res = await fetch(`${PAYCHANGU_API}/mobile-money`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${SECRET_KEY}` },
    });
    const body = await res.json();
    const list: MomoOperator[] = Array.isArray(body?.data)
      ? body.data.map((op: Record<string, unknown>) => ({
          name: String(op.name ?? ''),
          refId: String(op.ref_id ?? ''),
          shortCode: String(op.short_code ?? ''),
          supportsWithdrawals: Boolean(op.supports_withdrawals),
        }))
      : [];

    if (list.length > 0) {
      operatorCache = { at: Date.now(), list };
      return list;
    }
  } catch (error) {
    console.warn('Could not load PayChangu operators, using fallback:', error);
  }

  return Object.values(OPERATOR_FALLBACK);
}

/** Resolve the operator that owns a normalised number. */
export async function resolveOperator(normalized: string): Promise<MomoOperator | null> {
  const code = operatorCodeForPhone(normalized);
  if (!code) return null;

  const operators = await getOperators();
  const match = operators.find(
    (op) => op.shortCode.toLowerCase() === code && op.supportsWithdrawals
  );
  return match ?? OPERATOR_FALLBACK[code];
}

/* ------------------------------------------------------------------ *
 * PayChangu payout calls
 * ------------------------------------------------------------------ */

export interface PayoutInitResult {
  ok: boolean;
  status: 'pending' | 'success' | 'failed';
  gatewayRefId?: string | null;
  gatewayTransId?: string | null;
  failureReason?: string | null;
  raw?: unknown;
}

/** Map a PayChangu status string onto our three payout states. */
function normaliseStatus(value: unknown): 'pending' | 'success' | 'failed' | null {
  const status = String(value ?? '').toLowerCase();
  if (['success', 'successful', 'completed', 'paid'].includes(status)) return 'success';
  if (['failed', 'cancelled', 'canceled', 'expired', 'reversed', 'refunded'].includes(status)) {
    return 'failed';
  }
  if (['pending', 'processing', 'initiated', 'queued', 'in_progress'].includes(status)) {
    return 'pending';
  }
  return null;
}

/**
 * Ask PayChangu to send money to a mobile number.
 *
 * POST https://api.paychangu.com/mobile-money/payouts/initialize
 * `charge_id` is ours and is unique per payout, so a repeated call for the same
 * payout is rejected by the gateway rather than paying twice.
 */
export async function initiateMobilePayout(opts: {
  chargeId: string;
  normalizedPhone: string;
  operatorRefId: string;
  amount: number;
}): Promise<PayoutInitResult> {
  if (!SECRET_KEY) {
    return { ok: false, status: 'failed', failureReason: 'Gateway credentials are not configured.' };
  }

  let res: Response;
  try {
    res = await fetch(`${PAYCHANGU_API}/mobile-money/payouts/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        mobile_money_operator_ref_id: opts.operatorRefId,
        mobile: toGatewayMobile(opts.normalizedPhone),
        // Whole MWK; PayChangu takes the amount as a string.
        amount: String(Math.round(opts.amount)),
        charge_id: opts.chargeId,
      }),
    });
  } catch (error) {
    // Network level: we do not know whether the transfer was created, so this
    // is deliberately NOT reported as 'failed' — reconciliation decides.
    return {
      ok: false,
      status: 'pending',
      failureReason: `Could not reach the payout gateway: ${(error as Error).message}`,
    };
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const data = (body.data ?? {}) as Record<string, unknown>;
  const status = normaliseStatus(data.status) ?? normaliseStatus(body.status);

  if (!res.ok || status === 'failed') {
    return {
      ok: false,
      status: 'failed',
      failureReason:
        String(body.message ?? data.status ?? '') || `Payout gateway responded ${res.status}`,
      raw: body,
    };
  }

  // Transfers settle asynchronously, so 'pending' is the normal answer here.
  return {
    ok: true,
    status: status ?? 'pending',
    gatewayRefId: data.ref_id ? String(data.ref_id) : null,
    gatewayTransId: data.trans_id ? String(data.trans_id) : null,
    raw: body,
  };
}

export interface PayoutLookup {
  known: boolean;
  status: 'pending' | 'success' | 'failed' | null;
  failureReason?: string | null;
}

/**
 * Fetch the current state of a payout from PayChangu.
 * GET https://api.paychangu.com/direct-charge/payouts/{charge_id}/details
 */
export async function fetchPayoutStatus(chargeId: string): Promise<PayoutLookup> {
  if (!SECRET_KEY) return { known: false, status: null };

  try {
    const res = await fetch(
      `${PAYCHANGU_API}/direct-charge/payouts/${encodeURIComponent(chargeId)}/details`,
      {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${SECRET_KEY}` },
      }
    );
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { known: false, status: null };

    const data = (body.data ?? {}) as Record<string, unknown>;
    return {
      known: true,
      status: normaliseStatus(data.status) ?? normaliseStatus(body.status),
      failureReason: data.reason ? String(data.reason) : null,
    };
  } catch {
    return { known: false, status: null };
  }
}

/* ------------------------------------------------------------------ *
 * Refunds and reconciliation
 * ------------------------------------------------------------------ */

/**
 * Give a debited withdrawal back to the member — at most once.
 *
 * Returns true only if THIS call performed the reversal, so callers cannot
 * double-credit when two requests reconcile the same payout concurrently.
 */
export async function refundPayout(
  payoutId: string,
  reason: string
): Promise<boolean> {
  let reversed = false;

  await db.transaction(async (tx: typeof db) => {
    // Claim the payout: only one caller can move it out of 'pending'.
    const claimed = await tx
      .update(payouts)
      .set({ status: 'reversed', failureReason: reason, updatedAt: new Date(), completedAt: new Date() })
      .where(and(eq(payouts.id, payoutId), eq(payouts.status, 'pending')))
      .returning({
        id: payouts.id,
        userId: payouts.userId,
        walletId: payouts.walletId,
        grossAmount: payouts.grossAmount,
        phone: payouts.phone,
      });

    if (claimed.length === 0) return;
    const payout = claimed[0];

    const walletRows = await tx
      .select({ id: wallets.id, balance: wallets.balance })
      .from(wallets)
      .where(eq(wallets.id, payout.walletId!))
      .limit(1)
      .for('update');

    if (walletRows.length === 0) return;
    const wallet = walletRows[0];

    const before = parseFloat(wallet.balance?.toString() || '0');
    const amount = parseFloat(payout.grossAmount?.toString() || '0');
    const after = Math.round((before + amount) * 100) / 100;

    await tx
      .update(wallets)
      .set({ balance: after.toString(), updatedAt: new Date() })
      .where(eq(wallets.id, wallet.id));

    await tx.insert(transactions).values({
      walletId: wallet.id,
      userId: payout.userId,
      transactionType: 'withdrawal_refund',
      amount: amount.toString(),
      balanceBefore: before.toString(),
      balanceAfter: after.toString(),
      description: `Withdrawal to ${payout.phone} could not be completed — MWK ${amount.toLocaleString()} returned to your wallet`,
    });

    await tx.insert(notifications).values({
      userId: payout.userId,
      type: 'withdrawal',
      title: 'Withdrawal failed — funds returned',
      message: `We could not send MWK ${amount.toLocaleString()} to ${payout.phone}. The full amount is back in your wallet. Reason: ${reason}`,
      link: '/member-access',
      isRead: false,
    });

    reversed = true;
  });

  return reversed;
}

export interface ReconcileOutcome {
  status: string;
  refunded: boolean;
}

/**
 * Settle an in-flight payout against the gateway's own record.
 * Success is recorded; an explicit failure is refunded; anything unknown is
 * left pending so a transient outage never costs the member their money.
 */
export async function reconcilePayout(payout: {
  id: string;
  chargeId: string;
  status: string;
}): Promise<ReconcileOutcome> {
  if (payout.status !== 'pending') {
    return { status: payout.status, refunded: false };
  }

  const lookup = await fetchPayoutStatus(payout.chargeId);
  if (!lookup.known || lookup.status === null) {
    return { status: 'pending', refunded: false };
  }

  // A transfer still in flight is not a failure. Refunding it here would hand
  // the money back while the gateway may yet deliver it, so leave it pending
  // and let a later reconcile decide.
  if (lookup.status === 'pending') {
    return { status: 'pending', refunded: false };
  }

  if (lookup.status === 'success') {
    await db
      .update(payouts)
      .set({ status: 'success', updatedAt: new Date(), completedAt: new Date() })
      .where(and(eq(payouts.id, payout.id), eq(payouts.status, 'pending')));

    const row = await db
      .select({ userId: payouts.userId, netAmount: payouts.netAmount, phone: payouts.phone })
      .from(payouts)
      .where(eq(payouts.id, payout.id))
      .limit(1);

    if (row.length > 0) {
      await db.insert(notifications).values({
        userId: row[0].userId,
        type: 'withdrawal',
        title: 'Withdrawal sent',
        message: `MWK ${parseFloat(row[0].netAmount?.toString() || '0').toLocaleString()} was sent to ${row[0].phone}.`,
        link: '/member-access',
        isRead: false,
      });
    }

    return { status: 'success', refunded: false };
  }

  // Reached only for an explicit gateway failure.
  const refunded = await refundPayout(
    payout.id,
    lookup.failureReason || 'The mobile money transfer was rejected.'
  );
  return { status: refunded ? 'reversed' : 'pending', refunded };
}

/**
 * Reconcile a member's in-flight payouts. Called when they open their
 * withdrawals list so a payout that settled at the gateway eventually shows
 * the right state without a background worker.
 */
export async function reconcilePendingPayouts(userId: string, limit = 5): Promise<void> {
  const pending = await db
    .select({ id: payouts.id, chargeId: payouts.chargeId, status: payouts.status })
    .from(payouts)
    .where(and(eq(payouts.userId, userId), eq(payouts.status, 'pending')))
    .orderBy(desc(payouts.createdAt))
    .limit(limit);

  for (const row of pending) {
    try {
      await reconcilePayout(row);
    } catch (error) {
      console.warn(`Could not reconcile payout ${row.chargeId}:`, error);
    }
  }
}
