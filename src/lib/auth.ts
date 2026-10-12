import { db, client } from './db';
import { users, userSessions } from './db/schema';


export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionExpiresAt: Date | null;
}

/**
 * Validate a session token against the user_sessions table.
 * Returns the user if the token is valid and not expired, null otherwise.
 */
export async function getUserFromSession(sessionToken: string | undefined): Promise<SessionUser | null> {
  if (!sessionToken) return null;

  try {
    const { eq, and } = await import('drizzle-orm');
    const { userSessions, users } = await import('./db/schema');
    
    const result = await db
      .select({
        userId: users.id,
        fullName: users.fullName,
        email: users.email,
        isAdmin: users.isAdmin,
        isSubscribed: users.isSubscribed,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
      })
      .from(userSessions)
      .innerJoin(users, eq(users.id, userSessions.userId))
      // Only an ACTIVE account may use a session. A deactivated member's
      // tokens stop working immediately across every endpoint.
      .where(and(eq(userSessions.token, sessionToken), eq(users.isActive, true)));
    
    if (result.length === 0) return null;
    
    const row = result[0];
    const expiresAt = await db
      .select({ expiresAt: userSessions.expiresAt })
      .from(userSessions)
      .where(eq(userSessions.token, sessionToken));
    
    if (!expiresAt.length || expiresAt[0].expiresAt < new Date()) {
      return null;
    }

    return {
      id: row.userId,
      fullName: row.fullName,
      email: row.email,
      isAdmin: row.isAdmin || false,
      isSubscribed: row.isSubscribed || false,
      subscriptionExpiresAt: row.subscriptionExpiresAt || null,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Extract the Bearer token from the Authorization header.
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Get the authenticated user from a request.
 */
export async function getAuthUser(request: Request): Promise<SessionUser | null> {
  const token = extractBearerToken(request);
  if (!token) return null;
  return getUserFromSession(token);
}

/**
 * Generate a secure random token for sessions.
 */
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
