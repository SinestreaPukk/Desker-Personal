import type { Snapshot } from "@/context/snapshot";
import { findConflicts } from "./conflicts";

const DAY = 86_400_000;

/** Cross-domain week brief: structured data. Prose is added by jobs/weeklyDigest.ts; the Today rail renders this as-is. */
export function buildDigest(s: Snapshot) {
  const today = s.now.toISOString().slice(0, 10);
  return {
    conflicts: findConflicts(s),
    todayEvents: s.events.filter((e) => e.startsAt.toISOString().slice(0, 10) === today),
    weekEvents: s.events.filter((e) => +e.startsAt < +s.now + 7 * DAY).length,
    bills: s.openBills.slice(0, 5).map((b) => ({ id: b.id, payee: b.payee, totalMinor: b.totalMinor, dueOn: b.dueOn })),
    nextWorkout: s.workouts[0] ?? null,
    spend: { monthMinor: s.monthSpendMinor, budgetMinor: s.user.monthlyBudgetMinor, currency: s.user.currency },
  };
}
export type Digest = ReturnType<typeof buildDigest>;
