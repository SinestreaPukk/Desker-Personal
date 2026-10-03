import { and, asc, desc, eq, gte, isNull, lte } from "drizzle-orm";
import type { Db } from "@/db/client";
import { bills, events, goals, messages, tasks, users, workouts } from "@/db/schema";

const DAY = 86_400_000;

export type Snapshot = Awaited<ReturnType<typeof getSnapshot>>;

/** The one read model of the user's life. Agent, reasoning engine, digest and alerts all consume this. */
export async function getSnapshot(db: Db, userId: string, now = new Date()) {
  const horizon = new Date(now.getTime() + 14 * DAY);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new Error(`unknown user ${userId}`);

  const [upcomingEvents, openTasks, openBills, monthBills, upcomingWorkouts, activeGoals, recent] = await Promise.all([
    db.select().from(events).where(and(eq(events.userId, userId), gte(events.endsAt, now), lte(events.startsAt, horizon))).orderBy(asc(events.startsAt)),
    db.select().from(tasks).where(and(eq(tasks.userId, userId), isNull(tasks.doneAt))).orderBy(asc(tasks.dueAt)),
    db.select().from(bills).where(and(eq(bills.userId, userId), isNull(bills.paidAt))).orderBy(asc(bills.dueOn)),
    db.select().from(bills).where(and(eq(bills.userId, userId), gte(bills.issuedOn, monthStart.toISOString().slice(0, 10)))),
    db.select().from(workouts).where(and(eq(workouts.userId, userId), isNull(workouts.completedAt), gte(workouts.plannedAt, now), lte(workouts.plannedAt, horizon))).orderBy(asc(workouts.plannedAt)),
    db.select().from(goals).where(and(eq(goals.userId, userId), eq(goals.active, true))),
    db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.createdAt)).limit(20),
  ]);

  return {
    now,
    user: { id: user.id, name: user.name, timezone: user.timezone, currency: user.currency, monthlyBudgetMinor: user.monthlyBudgetMinor, preferences: user.preferences },
    events: upcomingEvents, tasks: openTasks, openBills,
    monthSpendMinor: monthBills.reduce((s, b) => s + b.totalMinor, 0),
    workouts: upcomingWorkouts, goals: activeGoals,
    recentMessages: recent.reverse(),
  };
}
