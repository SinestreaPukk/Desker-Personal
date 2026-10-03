import type { Snapshot } from "@/context/snapshot";

export type Conflict = {
  kind: "overlap" | "overloaded_week" | "budget" | "bill_due" | "workout_clash";
  severity: "warning" | "danger";
  message: string;
  refs: string[]; // ids of the rows involved
};

const DAY = 86_400_000;
const MAX_MEETING_HOURS_PER_DAY = 6;

type Input = Pick<Snapshot, "now" | "events" | "openBills" | "workouts" | "monthSpendMinor"> & {
  user: Pick<Snapshot["user"], "monthlyBudgetMinor" | "currency">;
};

/** Pure: same snapshot in, same conflicts out. The trade-off engine's deterministic core. */
export function findConflicts(s: Input): Conflict[] {
  const out: Conflict[] = [];
  const evs = [...s.events].sort((a, b) => +a.startsAt - +b.startsAt);

  // Overlapping events
  for (let i = 0; i < evs.length; i++) {
    for (let j = i + 1; j < evs.length && evs[j]!.startsAt < evs[i]!.endsAt; j++) {
      out.push({ kind: "overlap", severity: "danger", message: `"${evs[i]!.title}" overlaps "${evs[j]!.title}"`, refs: [evs[i]!.id, evs[j]!.id] });
    }
  }

  // Overloaded days
  const hoursByDay = new Map<string, number>();
  for (const e of evs) {
    const day = e.startsAt.toISOString().slice(0, 10);
    hoursByDay.set(day, (hoursByDay.get(day) ?? 0) + (+e.endsAt - +e.startsAt) / 3_600_000);
  }
  for (const [day, h] of hoursByDay) {
    if (h > MAX_MEETING_HOURS_PER_DAY) out.push({ kind: "overloaded_week", severity: "warning", message: `${day} is booked ${h.toFixed(1)}h`, refs: [] });
  }

  // Budget: spend so far + upcoming costed events + unpaid bills vs monthly budget
  const budget = s.user.monthlyBudgetMinor;
  if (budget) {
    const planned = evs.reduce((sum, e) => sum + (e.costMinor ?? 0), 0);
    const projected = s.monthSpendMinor + planned;
    if (projected > budget) {
      out.push({ kind: "budget", severity: "danger", message: `Projected spend ${projected / 100} ${s.user.currency} exceeds the ${budget / 100} budget`, refs: evs.filter((e) => e.costMinor).map((e) => e.id) });
    }
  }

  // Bills due within 3 days (or overdue)
  for (const b of s.openBills) {
    if (!b.dueOn) continue;
    const days = Math.ceil((Date.parse(b.dueOn) - s.now.getTime()) / DAY);
    if (days <= 3) out.push({ kind: "bill_due", severity: days < 0 ? "danger" : "warning", message: days < 0 ? `${b.payee} is ${-days}d overdue` : `${b.payee} is due in ${days}d`, refs: [b.id] });
  }

  // Workouts clashing with events
  for (const w of s.workouts) {
    const wEnd = +w.plannedAt + w.durationMin * 60_000;
    const clash = evs.find((e) => e.startsAt.getTime() < wEnd && +e.endsAt > +w.plannedAt);
    if (clash) out.push({ kind: "workout_clash", severity: "warning", message: `Workout "${w.title}" clashes with "${clash.title}"`, refs: [w.id, clash.id] });
  }
  return out;
}
