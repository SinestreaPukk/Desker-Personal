import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, date, index, uniqueIndex } from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const userId = () => uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" });
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const ts = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  lineUserId: text("line_user_id").unique(),
  currency: text("currency").notNull().default("THB"),
  monthlyBudgetMinor: integer("monthly_budget_minor"), // minor units (satang/cents)
  preferences: jsonb("preferences").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: createdAt(),
});

/** Calendar entries (local mirror; externalId links to Google/Outlook). */
export const events = pgTable("events", {
  id: id(), userId: userId(),
  title: text("title").notNull(),
  startsAt: ts("starts_at").notNull(), endsAt: ts("ends_at").notNull(),
  kind: text("kind", { enum: ["event", "meeting", "deadline", "travel"] }).notNull().default("event"),
  source: text("source").notNull().default("local"), externalId: text("external_id"),
  costMinor: integer("cost_minor"), // lets the engine weigh trips against budget
  createdAt: createdAt(),
}, (t) => [index("events_user_start").on(t.userId, t.startsAt), uniqueIndex("events_ext").on(t.userId, t.source, t.externalId)]);

export const tasks = pgTable("tasks", {
  id: id(), userId: userId(),
  title: text("title").notNull(),
  dueAt: ts("due_at"), remindAt: ts("remind_at"), remindedAt: ts("reminded_at"),
  doneAt: ts("done_at"), createdAt: createdAt(),
}, (t) => [index("tasks_user_due").on(t.userId, t.dueAt)]);

export const bills = pgTable("bills", {
  id: id(), userId: userId(),
  payee: text("payee").notNull(),
  category: text("category").notNull().default("other"),
  totalMinor: integer("total_minor").notNull(),
  issuedOn: date("issued_on").notNull(), dueOn: date("due_on"),
  paidAt: ts("paid_at"), source: text("source").notNull().default("manual"),
  createdAt: createdAt(),
}, (t) => [index("bills_user_due").on(t.userId, t.dueOn)]);

export const billLines = pgTable("bill_lines", {
  id: id(),
  billId: uuid("bill_id").notNull().references(() => bills.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  amountMinor: integer("amount_minor").notNull(),
});

export const workouts = pgTable("workouts", {
  id: id(), userId: userId(),
  title: text("title").notNull(),
  plannedAt: ts("planned_at").notNull(), durationMin: integer("duration_min").notNull().default(45),
  remindedAt: ts("reminded_at"), completedAt: ts("completed_at"),
}, (t) => [index("workouts_user_planned").on(t.userId, t.plannedAt)]);

export const goals = pgTable("goals", {
  id: id(), userId: userId(),
  domain: text("domain", { enum: ["money", "fitness", "career", "learning", "other"] }).notNull(),
  description: text("description").notNull(), active: boolean("active").notNull().default(true),
});

/** Conversation history, both channels interleaved. */
export const messages = pgTable("messages", {
  id: id(), userId: userId(),
  role: text("role", { enum: ["user", "agent"] }).notNull(),
  channel: text("channel", { enum: ["web", "line", "system"] }).notNull(),
  blocks: jsonb("blocks").notNull().$type<unknown[]>(), // Block[] from agent/blocks.ts
  createdAt: createdAt(),
}, (t) => [index("messages_user_created").on(t.userId, t.createdAt)]);

/** Consequential actions waiting for a chip tap. */
export const approvals = pgTable("approvals", {
  id: id(), userId: userId(),
  action: text("action").notNull(), // key into the consequential-action registry
  payload: jsonb("payload").notNull().$type<unknown>(),
  summary: text("summary").notNull(),
  status: text("status", { enum: ["pending", "approved", "declined", "failed"] }).notNull().default("pending"),
  result: jsonb("result").$type<unknown>(),
  createdAt: createdAt(), resolvedAt: ts("resolved_at"),
});

export const auditLog = pgTable("audit_log", {
  id: id(), userId: userId(),
  actor: text("actor", { enum: ["user", "agent", "system"] }).notNull(),
  action: text("action").notNull(), detail: jsonb("detail").$type<unknown>(),
  createdAt: createdAt(),
});

/** OAuth/API credentials per provider; tokens stored encrypted (see integrations/crypto.ts). */
export const connections = pgTable("connections", {
  id: id(), userId: userId(),
  provider: text("provider", { enum: ["google", "outlook", "slack", "twilio"] }).notNull(),
  encryptedTokens: text("encrypted_tokens").notNull(),
  syncCursor: text("sync_cursor"), createdAt: createdAt(),
}, (t) => [uniqueIndex("connections_user_provider").on(t.userId, t.provider)]);

/** One-time codes that link a LINE account to a web user ("link 123456" sent to the LINE OA). */
export const linkCodes = pgTable("link_codes", {
  code: text("code").primaryKey(),
  userId: userId(),
  expiresAt: ts("expires_at").notNull(),
});
