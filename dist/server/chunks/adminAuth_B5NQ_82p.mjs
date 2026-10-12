import { d as db, b as adminUsers, e as adminSessions } from './index_Bl8uyV_y.mjs';
import { eq } from 'drizzle-orm';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ success: false, message }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}
function generateAdminToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function requireAdmin(request) {
  const authHeader = request.headers.get("Authorization");
  let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : void 0;
  if (!token) {
    const raw = request.headers.get("Cookie") || "";
    const match = raw.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }
  if (!token) return null;
  try {
    const result = await db.select({
      id: adminUsers.id,
      username: adminUsers.username,
      email: adminUsers.email,
      role: adminUsers.role
    }).from(adminSessions).innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminId)).where(eq(adminSessions.token, token));
    if (result.length === 0) return null;
    const row = result[0];
    const expiresAt = await db.select({ expiresAt: adminSessions.expiresAt }).from(adminSessions).where(eq(adminSessions.token, token));
    if (!expiresAt.length || expiresAt[0].expiresAt < /* @__PURE__ */ new Date()) {
      return null;
    }
    return {
      id: row.id,
      username: row.username,
      email: row.email ?? "",
      role: row.role
    };
  } catch (error) {
    console.error("Admin auth error:", error);
    return null;
  }
}
function buildAdminCookie(token) {
  const secure = !process.env.FORCE_INSECURE_COOKIES && (Object.assign(__vite_import_meta_env__, { _: process.env._ })?.PROD ?? true);
  return `adminToken=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}
function clearAdminCookie() {
  return "adminToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax";
}

export { buildAdminCookie as b, clearAdminCookie as c, generateAdminToken as g, requireAdmin as r, unauthorized as u };
