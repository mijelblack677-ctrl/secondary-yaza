/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * The app runs as a single pm2 process (fork mode), so a per-process counter is
 * enough to blunt credential stuffing and brute-force attempts on the login
 * endpoints. Counters reset when the process restarts — fine for abuse
 * throttling, not a substitute for a shared store if this is ever scaled out.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

/** Honor the RATE_LIMIT_ENABLED env flag (defaults to on). */
function enabled(): boolean {
  return (process.env.RATE_LIMIT_ENABLED ?? 'true') !== 'false';
}

/** Drop buckets that have gone quiet so the map cannot grow without bound. */
function sweep(now: number, windowMs: number): void {
  const cutoff = now - windowMs;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => t > cutoff);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Record an attempt against `key` and report whether it is still allowed.
 * `maxHits` attempts are permitted per `windowMs`.
 */
export function rateLimit(key: string, maxHits: number, windowMs: number): RateLimitResult {
  if (!enabled()) return { allowed: true, retryAfterSeconds: 0 };

  const now = Date.now();
  // Cheap amortised cleanup rather than a timer per request.
  if (buckets.size > 500) sweep(now, windowMs);

  const cutoff = now - windowMs;
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= maxHits) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0]!;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client identity: nginx forwards the real address. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

/** Standard 429 response for a throttled request. */
export function tooManyRequests(
  retryAfterSeconds: number,
  message = 'Too many attempts. Please wait a moment and try again.'
): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfterSeconds),
    },
  });
}
