export type BillRow = { id: string; payee: string; totalMinor: number; issuedOn: string; dueOn: string | null; paidAt: Date | null };

export type BillInsights = {
  monthlyTrend: { month: string; totalMinor: number }[];
  anomalies: { billId: string; payee: string; totalMinor: number; typicalMinor: number }[];
  dueRisk: { billId: string; payee: string; daysLeft: number }[];
};

const ANOMALY_RATIO = 1.5;

/** Pure: spend trend, bills well above that payee's norm, and unpaid bills by urgency. */
export function billInsights(history: BillRow[], now: Date): BillInsights {
  const byMonth = new Map<string, number>();
  for (const b of history) byMonth.set(b.issuedOn.slice(0, 7), (byMonth.get(b.issuedOn.slice(0, 7)) ?? 0) + b.totalMinor);

  const byPayee = new Map<string, BillRow[]>();
  for (const b of history) byPayee.set(b.payee, [...(byPayee.get(b.payee) ?? []), b]);

  const anomalies = [];
  for (const rows of byPayee.values()) {
    for (const b of rows) {
      const others = rows.filter((r) => r.id !== b.id);
      if (others.length < 2) continue; // not enough history to call anything unusual
      const typical = others.reduce((s, r) => s + r.totalMinor, 0) / others.length;
      if (b.totalMinor > typical * ANOMALY_RATIO) anomalies.push({ billId: b.id, payee: b.payee, totalMinor: b.totalMinor, typicalMinor: Math.round(typical) });
    }
  }

  const dueRisk = history
    .filter((b) => !b.paidAt && b.dueOn)
    .map((b) => ({ billId: b.id, payee: b.payee, daysLeft: Math.ceil((Date.parse(b.dueOn!) - now.getTime()) / 86_400_000) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return { monthlyTrend: [...byMonth].sort().slice(-6).map(([month, totalMinor]) => ({ month, totalMinor })), anomalies, dueRisk };
}
