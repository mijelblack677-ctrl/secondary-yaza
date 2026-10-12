import { d as db, c as contentItems, g as userContentPurchases, u as users } from '../../../chunks/index_Bl8uyV_y.mjs';
import { and, eq } from 'drizzle-orm';
import { getAuthUser } from '../../../chunks/auth_CImtR7oD.mjs';
import { processContentPurchase } from '../../../chunks/purchases_XM3M2JdL.mjs';
import { s as startCheckout } from '../../../chunks/payments_CnoN0uJZ.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request }) => {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return json({ success: false, message: "Authentication required" }, 401);
    }
    const body = await request.json();
    const { contentId } = body;
    if (!contentId) {
      return json({ success: false, message: "Content ID is required" }, 400);
    }
    const content = await db.select().from(contentItems).where(and(eq(contentItems.id, contentId), eq(contentItems.isPremium, true)));
    if (content.length === 0) {
      return json({ success: false, message: "Content not found or not premium" }, 404);
    }
    const item = content[0];
    const price = parseFloat(item.price?.toString() || "0");
    const existing = await db.select().from(userContentPurchases).where(and(
      eq(userContentPurchases.userId, authUser.id),
      eq(userContentPurchases.contentId, contentId)
    ));
    if (existing.length > 0) {
      return json({ success: false, message: "You already own this content" }, 409);
    }
    const result = await processContentPurchase(authUser.id, contentId, price, item.title);
    if (result.success) {
      return json({
        success: true,
        message: result.message,
        newBalance: result.newBalance
      });
    }
    if (result.error === "INSUFFICIENT_BALANCE" && price > 0) {
      const me = await db.select({ id: users.id, fullName: users.fullName, email: users.email }).from(users).where(eq(users.id, authUser.id)).limit(1);
      if (me.length === 0) {
        return json({ success: false, message: "Account not found" }, 404);
      }
      const nameParts = (me[0].fullName || "Member").trim().split(/\s+/);
      const origin = new URL(request.url).origin;
      try {
        const { txRef, checkoutUrl } = await startCheckout({
          userId: me[0].id,
          email: me[0].email,
          firstName: nameParts[0] || "Member",
          lastName: nameParts.slice(1).join(" ") || "Member",
          paymentType: "book",
          amount: price,
          contentId,
          origin
        });
        return json({
          success: false,
          requiresPayment: true,
          txRef,
          checkoutUrl,
          message: `Pay MWK ${price.toLocaleString()} to buy "${item.title}".`
        });
      } catch (checkoutError) {
        console.error("Checkout creation failed:", checkoutError);
        return json(
          { success: false, message: "Could not start the payment. Please try again." },
          502
        );
      }
    }
    return json({ success: false, message: result.message }, 400);
  } catch (error) {
    console.error("Purchase error:", error);
    return json({ success: false, message: "Purchase failed" }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
