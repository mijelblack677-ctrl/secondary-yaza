import { d as db, e as adminSessions } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq } from 'drizzle-orm';
import { c as clearAdminCookie } from '../../../chunks/adminAuth_B5NQ_82p.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const raw = request.headers.get("Cookie") || "";
    const match = raw.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (match) {
      const token = decodeURIComponent(match[1]);
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
    }
  } catch (error) {
    console.error("Admin logout error:", error);
  }
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": clearAdminCookie() } }
  );
};
const GET = POST;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
