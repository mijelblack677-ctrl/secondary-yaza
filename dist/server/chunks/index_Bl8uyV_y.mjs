import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, timestamp, boolean, uuid, varchar, decimal, integer, text } from 'drizzle-orm/pg-core';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL not set - using fallback connection");
}
const client = postgres(connectionString || "postgresql://localhost:5432/secondary_yaza");
const db = drizzle(client);

const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 50 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  referralCode: varchar("referral_code", { length: 50 }).unique().notNull(),
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  policiesAcceptedAt: timestamp("policies_accepted_at", { withTimezone: true }),
  // Who invited this user (resolved from the referral code at registration).
  // The 500 MWK registration bonus is only credited once the account is
  // activated by a verified membership payment.
  referredBy: uuid("referred_by"),
  // Member subscription — registered users pay 2000 MWK to become members
  // and unlock the cheap-membership book collection.
  isSubscribed: boolean("is_subscribed").default(false),
  subscriptionExpiresAt: timestamp("subscription_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});
const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").unique().notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});
const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("admin"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const contentCategories = pgTable("content_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  iconSvg: text("icon_svg"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const contentItems = pgTable("content_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).unique().notNull(),
  description: text("description"),
  contentType: varchar("content_type", { length: 30 }).notNull(),
  // 'book', 'video', 'audio', 'guide'
  fileUrl: text("file_url"),
  thumbnailUrl: text("thumbnail_url"),
  author: varchar("author", { length: 255 }),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(false),
  isPremium: boolean("is_premium").default(false),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});
const userContentPurchases = pgTable("user_content_purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  contentId: uuid("content_id").notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletId: uuid("wallet_id"),
  userId: uuid("user_id"),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }),
  description: text("description"),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  txRef: varchar("tx_ref", { length: 255 }).unique().notNull(),
  paymentType: varchar("payment_type", { length: 30 }).notNull(),
  // 'subscription' | 'book'
  contentId: uuid("content_id"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 30 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true })
});
const referralClaims = pgTable("referral_claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  inviterId: uuid("inviter_id").notNull(),
  // the user who gave the code / got the 500
  inviteeId: uuid("invitee_id"),
  // nullptr on registration; set on first book buy
  inviteeRegisteredAt: timestamp("invitee_registered_at", { withTimezone: true }),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  // 500
  description: varchar("description", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

const index = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  adminSessions,
  adminUsers,
  contentCategories,
  contentItems,
  notifications,
  payments,
  referralClaims,
  transactions,
  userContentPurchases,
  userSessions,
  users,
  wallets
}, Symbol.toStringTag, { value: 'Module' }));

export { contentCategories as a, adminUsers as b, contentItems as c, db as d, adminSessions as e, userSessions as f, userContentPurchases as g, index as i, notifications as n, payments as p, referralClaims as r, transactions as t, users as u, wallets as w };
