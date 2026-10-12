import { d as db } from './index_Bl8uyV_y.mjs';

async function getUserFromSession(sessionToken) {
  if (!sessionToken) return null;
  try {
    const { eq, and } = await import('drizzle-orm');
    const { userSessions: userSessions2, users: users2 } = await import('./index_Bl8uyV_y.mjs').then(n => n.i);
    const result = await db.select({
      userId: users2.id,
      fullName: users2.fullName,
      email: users2.email,
      isAdmin: users2.isAdmin,
      isSubscribed: users2.isSubscribed,
      subscriptionExpiresAt: users2.subscriptionExpiresAt
    }).from(userSessions2).innerJoin(users2, eq(users2.id, userSessions2.userId)).where(and(eq(userSessions2.token, sessionToken), eq(users2.isActive, true)));
    if (result.length === 0) return null;
    const row = result[0];
    const expiresAt = await db.select({ expiresAt: userSessions2.expiresAt }).from(userSessions2).where(eq(userSessions2.token, sessionToken));
    if (!expiresAt.length || expiresAt[0].expiresAt < /* @__PURE__ */ new Date()) {
      return null;
    }
    return {
      id: row.userId,
      fullName: row.fullName,
      email: row.email,
      isAdmin: row.isAdmin || false,
      isSubscribed: row.isSubscribed || false,
      subscriptionExpiresAt: row.subscriptionExpiresAt || null
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}
function extractBearerToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
async function getAuthUser(request) {
  const token = extractBearerToken(request) || readCookie(request, "token") || void 0;
  if (!token) return null;
  return getUserFromSession(token);
}
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function buildSessionCookie(token, expiresAt, name = "token") {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1e3));
  const secure = process.env.FORCE_INSECURE_COOKIES === "1" ? "" : "; Secure";
  return `${name}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}
const CLEAR_SESSION_COOKIE_HEADER = (name = "token") => `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export { CLEAR_SESSION_COOKIE_HEADER, buildSessionCookie, extractBearerToken, generateToken, getAuthUser, getUserFromSession, readCookie };
