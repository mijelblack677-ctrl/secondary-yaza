import { d as db, w as wallets, u as users, r as referralClaims } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '../../../chunks/auth_CImtR7oD.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return new Response(
        JSON.stringify({ success: false, message: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const user = await db.select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      referralCode: users.referralCode,
      isAdmin: users.isAdmin,
      isActive: users.isActive,
      isSubscribed: users.isSubscribed,
      subscriptionExpiresAt: users.subscriptionExpiresAt,
      policiesAcceptedAt: users.policiesAcceptedAt,
      walletBalance: wallets.balance
    }).from(users).leftJoin(wallets, eq(wallets.userId, users.id)).where(eq(users.id, authUser.id)).limit(1);
    if (user.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const row = user[0];
    const referralRows = await db.select({ amount: referralClaims.amount }).from(referralClaims).where(eq(referralClaims.inviterId, authUser.id));
    const referralCount = referralRows.reduce(
      (sum, r) => sum + (parseInt(r.amount || "0", 10) || 0),
      0
    );
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: row.id,
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          referralCode: row.referralCode,
          isAdmin: row.isAdmin,
          isActive: row.isActive,
          isSubscribed: row.isSubscribed,
          subscriptionExpiresAt: row.subscriptionExpiresAt,
          policiesAcceptedAt: row.policiesAcceptedAt,
          walletBalance: row.walletBalance ?? "0",
          referralCount
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auth/me error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to load account" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
