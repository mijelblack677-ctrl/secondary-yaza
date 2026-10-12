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

/**
 * Validate the request's Bearer token as an active admin session.
 */
export async function requireAdmin(request: Request): Promise<AdminUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');

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
    
    if (!expiresAt.length || expiresAt[0].expiresAt < new Date()) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
    };
  } catch (error) {
    console.error('Admin auth error:', error);
    return null;
  }
}

export function generateAdminToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
