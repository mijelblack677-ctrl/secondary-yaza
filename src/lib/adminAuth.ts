import { db } from './db';
import { adminSessions, adminUsers } from './db/schema';
import { eq } from 'drizzle-orm';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function unauthorized(message = 'Unauthorized'): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Cryptographically-random admin session token. */
export function generateAdminToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate the request's Bearer token or HttpOnly adminToken cookie as an
 * active admin session.
 */
export async function requireAdmin(request: Request): Promise<AdminUser | null> {
  const authHeader = request.headers.get('Authorization');
  let token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : undefined;

  // Fall back to the HttpOnly cookie (sent automatically with same-origin fetches).
  if (!token) {
    const raw = request.headers.get('Cookie') || '';
    const match = raw.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return null;

  try {
    const result = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        role: adminUsers.role,
      })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminId))
      .where(eq(adminSessions.token, token));
    
    if (result.length === 0) return null;
    
    const row = result[0];
    const expiresAt = await db
      .select({ expiresAt: adminSessions.expiresAt })
      .from(adminSessions)
      .where(eq(adminSessions.token, token));
    
    if (!expiresAt.length || expiresAt[0]!.expiresAt < new Date()) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email ?? '',
      role: row.role,
    };
  } catch (error) {
    console.error('Admin auth error:', error);
    return null;
  }
}

/** Set the HttpOnly admin session cookie (never readable from JS). */
export function buildAdminCookie(token: string): string {
  const secure =
    !process.env.FORCE_INSECURE_COOKIES &&
    (import.meta.env?.PROD ?? true);
  return `adminToken=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

/** Clear the admin session cookie. */
export function clearAdminCookie(): string {
  return 'adminToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';
}

/** Read a named cookie from a Request. */
export function readAdminCookie(request: Request, name: string): string | undefined {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
