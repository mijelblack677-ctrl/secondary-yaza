import { d as db, u as users } from '../../../chunks/index_Bl8uyV_y.mjs';
import { eq } from 'drizzle-orm';
import { a as validatePasswordStrength, h as hashPassword, g as generateReferralCode } from '../../../chunks/password_76TxhK7u.mjs';
import { buildSessionCookie } from '../../../chunks/auth_CImtR7oD.mjs';
import { S as SUBSCRIPTION_MWK, a as autoVerifyPendingPayments, s as startCheckout } from '../../../chunks/payments_CnoN0uJZ.mjs';
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
    const body = await request.json();
    const { fullName, email, phone, password, policiesAcceptedAt, referralCode } = body;
    if (!policiesAcceptedAt || typeof policiesAcceptedAt !== "string") {
      return json({
        success: false,
        message: "You must accept the Terms of Service and Privacy Policy before creating an account."
      }, 400);
    }
    if (!fullName || !email || !phone || !password) {
      return json({
        success: false,
        message: "Full name, email, phone, and password are required"
      }, 400);
    }
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return json({ success: false, message: passwordError }, 400);
    }
    const emailLower = email.toLowerCase();
    const enteredReferralCode = typeof referralCode === "string" ? referralCode.trim() : "";
    let referredBy = null;
    if (enteredReferralCode) {
      const inviter = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, enteredReferralCode)).limit(1);
      if (inviter.length > 0) {
        referredBy = inviter[0].id;
      }
    }
    const origin = new URL(request.url).origin;
    const nameParts = String(fullName).trim().split(/\s+/);
    const checkoutArgs = {
      email: emailLower,
      firstName: nameParts[0] || "Member",
      lastName: nameParts.slice(1).join(" ") || "Member",
      paymentType: "subscription",
      amount: SUBSCRIPTION_MWK,
      origin
    };
    const existing = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    let accountId;
    if (existing.length > 0) {
      const account = existing[0];
      if (account.isActive) {
        return json(
          { success: false, message: "Email already registered — please sign in instead." },
          409
        );
      }
      const revived = await autoVerifyPendingPayments(account.id);
      if (revived?.activated && revived.token) {
        return new Response(
          JSON.stringify({
            success: true,
            activated: true,
            message: "Your payment was already completed — welcome!"
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": buildSessionCookie(revived.token, new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3))
            }
          }
        );
      }
      const phoneOwner = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
      if (phoneOwner.length > 0 && phoneOwner[0].id !== account.id) {
        return json({ success: false, message: "Phone number already registered" }, 409);
      }
      await db.update(users).set({
        fullName,
        phone,
        passwordHash: await hashPassword(password),
        referredBy,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.id, account.id));
      accountId = account.id;
    } else {
      const existingPhone = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
      if (existingPhone.length > 0) {
        return json({ success: false, message: "Phone number already registered" }, 409);
      }
      accountId = crypto.randomUUID();
      await db.insert(users).values({
        id: accountId,
        fullName,
        email: emailLower,
        phone,
        passwordHash: await hashPassword(password),
        referralCode: generateReferralCode(),
        referredBy,
        isAdmin: false,
        // Pending until PayChangu confirms the MWK 2,000 membership fee.
        isActive: false,
        isSubscribed: false,
        policiesAcceptedAt: new Date(policiesAcceptedAt)
      });
    }
    let checkout;
    try {
      checkout = await startCheckout({ userId: accountId, ...checkoutArgs });
    } catch (paymentError) {
      console.error("Checkout creation failed during registration:", paymentError);
      return json(
        {
          success: false,
          message: "Your registration is incomplete because the payment could not be started. Please try again — no account is active until the membership fee is paid."
        },
        502
      );
    }
    return json({
      success: true,
      requiresPayment: true,
      message: `Complete your MWK ${SUBSCRIPTION_MWK.toLocaleString()} membership payment to activate your account.`,
      checkoutUrl: checkout.checkoutUrl,
      txRef: checkout.txRef
    });
  } catch (error) {
    console.error("Registration error:", error);
    return json({ success: false, message: "Registration failed" }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
