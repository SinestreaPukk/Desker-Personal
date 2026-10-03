import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { goals, tasks, workouts } from "@/db/schema";
import { defineTool } from "../tool";

const when = z.string().datetime({ offset: true });

export const addTask = defineTool({
  name: "add_task", kind: "read", // writes only our own context store; reversible
  description: "Create a task or reminder. remindAt is when to ping the user (in app and LINE).",
  schema: z.object({ title: z.string(), dueAt: when.optional(), remindAt: when.optional() }),
  async execute({ db, userId }, i) {
    await db.insert(tasks).values({ userId, title: i.title, dueAt: i.dueAt ? new Date(i.dueAt) : null, remindAt: i.remindAt ? new Date(i.remindAt) : null });
    return { text: `Task saved: ${i.title}` };
  },
});

export const completeTask = defineTool({
  name: "complete_task", kind: "read",
  description: "Mark a task done by id.",
  schema: z.object({ taskId: z.string().uuid() }),
  async execute({ db, userId, now }, i) {
    await db.update(tasks).set({ doneAt: now }).where(and(eq(tasks.id, i.taskId), eq(tasks.userId, userId)));
    return { text: "Marked done" };
  },
});

export const planWorkouts = defineTool({
  name: "plan_workouts", kind: "read",
  description: "Schedule workouts. Check conflicts afterwards with analyze_tradeoffs.",
  schema: z.object({ workouts: z.array(z.object({ title: z.string(), plannedAt: when, durationMin: z.number().int().default(45) })).min(1) }),
  async execute({ db, userId }, i) {
    const planned = await db.insert(workouts).values(i.workouts.map((w) => ({ userId, title: w.title, plannedAt: new Date(w.plannedAt), durationMin: w.durationMin }))).returning();
    return { text: `Planned ${planned.length} workouts`, blocks: [{ type: "card", variant: "workout", title: "Workout plan", data: planned }] };
  },
});

export const setGoal = defineTool({
  name: "set_goal", kind: "read",
  description: "Record a goal in the user's context (money, fitness, career, learning).",
  schema: z.object({ domain: z.enum(["money", "fitness", "career", "learning", "other"]), description: z.string() }),
  async execute({ db, userId }, i) {
    await db.insert(goals).values({ userId, ...i });
    return { text: "Goal recorded" };
  },
});
