import { d as db, b as adminUsers, e as adminSessions } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq } from 'drizzle-orm';
import { v as verifyPassword, h as hashPassword } from '../../../chunks/password_76TxhK7u.mjs';
import { g as generateAdminToken, b as buildAdminCookie } from '../../../chunks/adminAuth_B5NQ_82p.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Username and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const admin = result[0];
    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!admin.isActive) {
      return new Response(
        JSON.stringify({ success: false, message: "Admin account is deactivated" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const token = generateAdminToken();
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + 24 * 7);
    await db.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));
    await db.insert(adminSessions).values({
      id: crypto.randomUUID(),
      adminId: admin.id,
      token,
      expiresAt
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin login successful",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
        // Token is NOT returned in the body — it is delivered only via the
        // HttpOnly cookie below so XSS cannot steal the admin session.
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": buildAdminCookie(token)
        }
      }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Login failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
async function createFirstAdmin(username, email, password) {
  const passwordHash = await hashPassword(password);
  const result = await db.insert(adminUsers).values({
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    role: "superadmin",
    isActive: true
  }).returning();
  return result[0];
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  createFirstAdmin,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
