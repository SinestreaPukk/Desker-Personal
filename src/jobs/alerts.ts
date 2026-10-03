import { and, eq, isNull, lte, sql } from "drizzle-orm";
import type { Block } from "@/agent/blocks";
import type { Db } from "@/db/client";
import { getSnapshot } from "@/context/snapshot";
import { auditLog, tasks, users, workouts } from "@/db/schema";
import { findConflicts } from "@/reasoning/conflicts";

type Notify = (userId: string, blocks: Block[]) => Promise<void>;
const text = (t: string): Block => ({ type: "text", text: t });

/** Sends each alert at most once: the key is recorded in audit_log and checked before sending. */
async function once(db: Db, userId: string, key: string, send: () => Promise<void>) {
  const [seen] = await db.select({ id: auditLog.id }).from(auditLog)
    .where(and(eq(auditLog.userId, userId), eq(auditLog.action, "alert.sent"), sql`${auditLog.detail}->>'key' = ${key}`)).limit(1);
  if (seen) return;
  await send();
  await db.insert(auditLog).values({ userId, actor: "system", action: "alert.sent", detail: { key } });
}

/** One user's proactive checks: reminders, workouts about to start, bills due, new conflicts. Called every minute by /api/cron/tick. */
export async function runAlerts(db: Db, userId: string, notify: Notify, now = new Date()) {
  const snap = await getSnapshot(db, userId, now);

  const dueTasks = await db.select().from(tasks).where(and(eq(tasks.userId, userId), isNull(tasks.doneAt), isNull(tasks.remindedAt), lte(tasks.remindAt, now)));
  for (const t of dueTasks) {
    await notify(userId, [text(`Reminder: ${t.title}`)]);
    await db.update(tasks).set({ remindedAt: now }).where(eq(tasks.id, t.id));
  }

  const soon = new Date(now.getTime() + 30 * 60_000);
  const dueWorkouts = await db.select().from(workouts).where(and(eq(workouts.userId, userId), isNull(workouts.completedAt), isNull(workouts.remindedAt), lte(workouts.plannedAt, soon)));
  for (const w of dueWorkouts.filter((w) => w.plannedAt > now)) {
    await notify(userId, [text(`${w.title} starts in ${Math.max(1, Math.round((+w.plannedAt - +now) / 60_000))} min. ${w.durationMin} minutes, you've got this.`)]);
    await db.update(workouts).set({ remindedAt: now }).where(eq(workouts.id, w.id));
  }

  // Conflicts the engine caught; "key" includes the refs so a changed situation re-alerts but an unchanged one doesn't.
  for (const c of findConflicts(snap)) {
    await once(db, userId, `${c.kind}:${c.refs.join(",") || c.message}`, () => notify(userId, [text(c.message + (c.severity === "danger" ? ". Want me to sort it out?" : "."))]));
  }
}

export async function runAlertsForAll(db: Db, notify: Notify, now = new Date()) {
  for (const u of await db.select({ id: users.id }).from(users)) {
    try { await runAlerts(db, u.id, notify, now); } catch (e) { console.error("alerts failed", u.id, e); }
  }
}
