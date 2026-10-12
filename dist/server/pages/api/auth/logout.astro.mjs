import { extractBearerToken, getUserFromSession } from '../../../chunks/auth_CImtR7oD.mjs';
import { d as db, f as userSessions } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    let sessionToken = extractBearerToken(request);
    if (!sessionToken) {
      const { readCookie } = await import('../../../chunks/auth_CImtR7oD.mjs');
      sessionToken = readCookie(request, "token") || void 0;
    }
    const user = sessionToken ? await getUserFromSession(sessionToken) : null;
    if (user && sessionToken) {
      await db.delete(userSessions).where(eq(userSessions.token, sessionToken));
    }
    return new Response(
      JSON.stringify({ success: true, message: "Logged out successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
        }
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Logout failed" }),
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
