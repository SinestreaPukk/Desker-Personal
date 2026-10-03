import { eq } from "drizzle-orm";
import { afterAll, expect, test } from "vitest";
import { db } from "@/db/client";
import { auditLog, events, users } from "@/db/schema";
import { requestApproval, resolveApproval } from "./approvals";

// Needs Postgres: `npm run db:up && npm run db:migrate`.
const [user] = await db.insert(users).values({ name: "Test" }).returning();
const uid = user!.id;
afterAll(async () => { await db.delete(users).where(eq(users.id, uid)); });

const input = { title: "Dentist", startsAt: "2026-10-05T09:00:00Z", endsAt: "2026-10-05T10:00:00Z", kind: "event" };
const count = async () => (await db.select().from(events).where(eq(events.userId, uid))).length;

test("nothing executes until Yes; double-tap doesn't double-execute; every step is audited", async () => {
  const card = await requestApproval(db, uid, "create_event", input, "Add Dentist");
  
  expect(await count()).toBe(0);

  expect((await resolveApproval(db, uid, card.approvalId, "yes")).status).toBe("approved");
  await resolveApproval(db, uid, card.approvalId, "yes");
  expect(await count()).toBe(1);

  const audit = await db.select().from(auditLog).where(eq(auditLog.userId, uid));
  expect(audit.map((a) => a.action)).toEqual(expect.arrayContaining(["approval.requested", "approval.approved", "approval.executed"]));
});

test("No never executes", async () => {
  const card = await requestApproval(db, uid, "create_event", input, "Add Dentist");
  
  expect((await resolveApproval(db, uid, card.approvalId, "no")).status).toBe("declined");
  expect(await count()).toBe(1);
});
