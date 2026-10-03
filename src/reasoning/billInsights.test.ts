import { expect, test } from "vitest";
import { billInsights } from "./billInsights";

const b = (id: string, total: number, on: string, dueOn: string | null = null, paid = true) =>
  ({ id, payee: "Electric", totalMinor: total, issuedOn: on, dueOn, paidAt: paid ? new Date() : null });

test("flags the spike, orders due risk, builds trend", () => {
  const out = billInsights(
    [b("1", 100, "2026-08-01"), b("2", 110, "2026-09-01"), b("3", 400, "2026-10-01", "2026-10-05", false)],
    new Date("2026-10-03"),
  );
  expect(out.anomalies.map((a) => a.billId)).toEqual(["3"]);
  expect(out.dueRisk).toEqual([{ billId: "3", payee: "Electric", daysLeft: 2 }]);
  expect(out.monthlyTrend).toHaveLength(3);
});
