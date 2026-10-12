import { d as db, u as users, f as userSessions } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq } from 'drizzle-orm';
import { v as verifyPassword } from '../../../chunks/password_76TxhK7u.mjs';
import { generateToken, buildSessionCookie } from '../../../chunks/auth_CImtR7oD.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const user = result[0];
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!user.isActive) {
      return new Response(
        JSON.stringify({ success: false, message: "Account is deactivated" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const token = generateToken();
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + 24 * 30);
    await db.delete(userSessions).where(eq(userSessions.userId, user.id));
    await db.insert(userSessions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          isAdmin: user.isAdmin
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": buildSessionCookie(token, expiresAt)
        }
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Login failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
