import { expect, test } from "vitest";
import { findConflicts } from "./conflicts";

const t = (h: number) => new Date(Date.UTC(2026, 9, 5, h));
const ev = (id: string, title: string, s: number, e: number, costMinor?: number) =>
  ({ id, title, startsAt: t(s), endsAt: t(e), costMinor: costMinor ?? null }) as never;

test("trip over budget + overlap + workout clash + bill due", () => {
  const now = t(0);
  const out = findConflicts({
    now,
    user: { monthlyBudgetMinor: 100_000, currency: "THB" },
    monthSpendMinor: 70_000,
    events: [ev("a", "Standup", 9, 10), ev("b", "Review", 9, 11), ev("c", "Bali trip", 12, 13, 50_000)],
    openBills: [{ id: "x", payee: "Electric", dueOn: "2026-10-06" }] as never,
    workouts: [{ id: "w", title: "Run", plannedAt: t(10), durationMin: 60 }] as never,
  });
  expect(out.map((c) => c.kind).sort()).toEqual(["bill_due", "budget", "overlap", "workout_clash"].sort());
});
