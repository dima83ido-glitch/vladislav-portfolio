import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Admin-editable text is stored as JSON keyed by locale rather than in a
 * join table — English is required, uk/ru are optional and fall back to
 * English in the UI. Keeps the CMS relationally simple while preserving
 * full i18n for content that used to live in messages/*.json.
 */
export type LocalizedText = { en: string; uk?: string; ru?: string };
export type LocalizedList = { en: string[]; uk?: string[]; ru?: string[] };

export type PhilosophyCard = { icon: string; title: LocalizedText; description: LocalizedText };
export type HeroStat = { value: number; suffix: string; label: LocalizedText };

// ============================== Enums ==============================

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "deleted"]);
export const verificationPurposeEnum = pgEnum("verification_purpose", [
  "login",
  "register",
  "password_reset",
]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "published"]);
export const periodKeyEnum = pgEnum("period_key", ["oneTime", "quote"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
  "payment_rejected",
]);
export const paymentMethodEnum = pgEnum("payment_method", ["stripe", "crypto"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "awaiting_confirmation",
  "approved",
  "rejected",
  "failed",
]);
export const cryptoCurrencyEnum = pgEnum("crypto_currency", [
  "BTC",
  "ETH",
  "USDT_TRC20",
  "USDT_ERC20",
  "TON",
  "SOL",
]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "awaiting_admin",
  "awaiting_user",
  "closed",
]);
export const notificationSectionEnum = pgEnum("notification_section", ["support", "orders"]);

// ========================== Auth / identity ==========================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("customer"),
  displayName: text("display_name"),
  username: text("username").unique(),
  status: userStatusEnum("status").notNull().default("active"),
  /**
   * Nullable: accounts created before password-backed auth shipped have no
   * hash yet. See `loginRequestCode` in lib/auth/actions.ts for the
   * claim-on-first-login path that backfills this for those accounts.
   * NEVER select this column into anything that reaches a page/component —
   * use `safeUserColumns` (below) for any user row a query returns for
   * display.
   */
  passwordHash: text("password_hash"),
  /**
   * At most one of these two is ever set — picking one clears the other.
   * Both null falls back to the initials badge. `avatarUrl` is a Cloudinary
   * `secure_url`; `avatarEmoji` is one of BUILTIN_AVATARS (src/lib/account/avatar.ts).
   */
  avatarUrl: text("avatar_url"),
  avatarEmoji: text("avatar_emoji"),
  /** Cloudinary public_id for `avatarUrl` — lets a replaced/removed avatar's old asset be deleted by ID instead of parsed back out of the URL. Null whenever avatarUrl is null. */
  avatarPublicId: text("avatar_public_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

/** Every column except `passwordHash` — use this instead of the bare `users`
 * table reference whenever a query's result reaches a page or component. */
export const safeUserColumns = {
  id: users.id,
  email: users.email,
  role: users.role,
  displayName: users.displayName,
  username: users.username,
  status: users.status,
  avatarUrl: users.avatarUrl,
  avatarEmoji: users.avatarEmoji,
  avatarPublicId: users.avatarPublicId,
  createdAt: users.createdAt,
  lastLoginAt: users.lastLoginAt,
};

export const verificationCodes = pgTable("verification_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  purpose: verificationPurposeEnum("purpose").notNull().default("login"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  attempts: smallint("attempts").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========================= Rate limiting =========================

export const rateLimitHits = pgTable("rate_limit_hits", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================ Reviews ============================

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  rating: smallint("rating").notNull(),
  body: text("body").notNull(),
  locale: text("locale").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  moderatedAt: timestamp("moderated_at", { withTimezone: true }),
  moderatedBy: uuid("moderated_by").references(() => users.id, { onDelete: "set null" }),
});

// ======================= Pricing CMS =======================

export const pricingPlans = pgTable("pricing_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").notNull().$type<LocalizedText>(),
  description: jsonb("description").notNull().$type<LocalizedText>(),
  features: jsonb("features").notNull().$type<LocalizedList>(),
  price: text("price").notNull(),
  /** Cents; null for quote-only plans (not directly orderable — same convention as the static pricing data). */
  priceCents: integer("price_cents"),
  periodKey: periodKeyEnum("period_key").notNull(),
  highlighted: boolean("highlighted").notNull().default(false),
  showOnHomepage: boolean("show_on_homepage").notNull().default(false),
  ctaOverrideHref: text("cta_override_href"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: contentStatusEnum("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ====================== Portfolio CMS ======================

export const portfolioProjects = pgTable("portfolio_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: jsonb("title").notNull().$type<LocalizedText>(),
  category: jsonb("category").notNull().$type<LocalizedText>(),
  description: jsonb("description").notNull().$type<LocalizedText>(),
  results: jsonb("results").$type<LocalizedText>(),
  technologies: text("technologies")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  coverImageUrl: text("cover_image_url"),
  /** Cloudinary public_id for coverImageUrl — null when the URL was pasted manually rather than uploaded, or when there's no cover image. */
  coverImagePublicId: text("cover_image_public_id"),
  videoUrl: text("video_url"),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  seoTitle: jsonb("seo_title").$type<LocalizedText>(),
  seoDescription: jsonb("seo_description").$type<LocalizedText>(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: contentStatusEnum("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ================== About / Services / Skills CMS ==================

/** Singleton row (id is always 1) holding the About section + Hero stats. */
export const aboutContent = pgTable("about_content", {
  id: integer("id").primaryKey().default(1),
  biography: jsonb("biography").notNull().$type<LocalizedList>(),
  philosophyCards: jsonb("philosophy_cards").notNull().$type<PhilosophyCard[]>(),
  heroStats: jsonb("hero_stats").notNull().$type<HeroStat[]>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  title: jsonb("title").notNull().$type<LocalizedText>(),
  description: jsonb("description").notNull().$type<LocalizedText>(),
  features: jsonb("features").notNull().$type<LocalizedList>(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: contentStatusEnum("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const skillGroups = pgTable("skill_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: jsonb("category").notNull().$type<LocalizedText>(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => skillGroups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: smallint("level").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ========================= Orders =========================

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").references(() => pricingPlans.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  /** Cents. */
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("usd"),
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderMessages = pgTable("order_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderFiles = pgTable("order_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  uploaderId: uuid("uploader_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========================= Payments =========================

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  method: paymentMethodEnum("method").notNull(),
  /** Cents. */
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  cryptoCurrency: cryptoCurrencyEnum("crypto_currency"),
  cryptoTxHash: text("crypto_tx_hash"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========================= Support =========================

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => supportTickets.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ======================= Notifications =======================

/**
 * One row per recipient per event — a new ticket notifies every admin as N
 * separate rows, not one shared row. `section` is the badge/mark-as-read
 * grouping key (Support, My Orders); `resourceId` points at the ticket or
 * order the event is about, `kind` at what happened (see
 * src/db/queries/notifications.ts for the fixed set of kinds in use).
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  section: notificationSectionEnum("section").notNull(),
  kind: text("kind").notNull(),
  resourceId: uuid("resource_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================ Types ============================

export type User = typeof users.$inferSelect;
/** Shape returned by `safeUserColumns` — every query that surfaces a user row to a page/component should use this type, never `User`. */
export type SafeUser = Omit<User, "passwordHash">;
export type NewUser = typeof users.$inferInsert;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type NewPricingPlan = typeof pricingPlans.$inferInsert;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type NewPortfolioProject = typeof portfolioProjects.$inferInsert;
export type AboutContent = typeof aboutContent.$inferSelect;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type SkillGroup = typeof skillGroups.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderMessage = typeof orderMessages.$inferSelect;
export type OrderFile = typeof orderFiles.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type SupportMessage = typeof supportMessages.$inferSelect;
