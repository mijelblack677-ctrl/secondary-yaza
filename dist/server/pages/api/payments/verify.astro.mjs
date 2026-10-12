import { d as db, p as payments, u as users } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq, and } from 'drizzle-orm';
import { buildSessionCookie, getAuthUser, getUserFromSession } from '../../../chunks/auth_CImtR7oD.mjs';
import { v as verifyPayChanguPayment, f as fulfillPaidPayment } from '../../../chunks/payments_CnoN0uJZ.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
async function resolveUser(request) {
  const direct = await getAuthUser(request);
  if (direct) return direct;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  if (match) return getUserFromSession(match[1]);
  return null;
}
const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const txRef = url.searchParams.get("tx_ref") || url.searchParams.get("txRef");
    if (!txRef) {
      return json({ success: false, message: "Missing tx_ref" }, 400);
    }
    const rows = await db.select().from(payments).where(eq(payments.txRef, txRef)).limit(1);
    if (rows.length === 0) {
      return json({ success: false, message: "Payment not found" }, 404);
    }
    const payment = rows[0];
    const user = await resolveUser(request);
    let mayProceed = false;
    if (user && (payment.userId === user.id || user.isAdmin)) {
      mayProceed = true;
    } else if (!user && payment.paymentType === "subscription" && payment.userId) {
      const account = await db.select({ id: users.id, isActive: users.isActive }).from(users).where(eq(users.id, payment.userId)).limit(1);
      mayProceed = account.length > 0 && account[0].isActive === false;
    }
    if (!mayProceed) {
      return json({ success: false, message: "Payment not found" }, 404);
    }
    if (payment.status === "paid") {
      return json({
        success: true,
        status: "paid",
        paymentType: payment.paymentType,
        contentId: payment.contentId,
        amount: payment.amount
      });
    }
    const result = await verifyPayChanguPayment(txRef);
    if (result.confirmedPaid) {
      const outcome = await fulfillPaidPayment(payment);
      if (outcome.alreadyProcessed) {
        return json({
          success: true,
          status: "paid",
          paymentType: payment.paymentType,
          contentId: payment.contentId,
          amount: payment.amount
        });
      }
      const headers = { "Content-Type": "application/json" };
      if (outcome.activated && outcome.token) {
        headers["Set-Cookie"] = buildSessionCookie(
          outcome.token,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          status: "paid",
          paymentType: payment.paymentType,
          contentId: payment.contentId,
          amount: payment.amount,
          activated: Boolean(outcome.activated),
          redirectTo: outcome.activated ? "/library" : null
        }),
        { status: 200, headers }
      );
    }
    if (result.explicitlyFailed) {
      await db.update(payments).set({ status: "failed", updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(payments.id, payment.id), eq(payments.status, "pending")));
      return json({
        success: false,
        status: "failed",
        paymentType: payment.paymentType,
        message: payment.paymentType === "subscription" && !user ? "The payment was not completed, so no account was created. Please try again." : "The payment was not completed. You can try again."
      });
    }
    return json({
      success: false,
      status: "pending",
      paymentType: payment.paymentType,
      message: "Payment is still processing. Please try again in a moment."
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return json({ success: false, message: "Verification failed. Please try again." }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
