"use client";
import type { Block } from "@/agent/blocks";
import type { Digest } from "@/reasoning/digest";
import type { BillInsights } from "@/reasoning/billInsights";

export const money = (minor: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
const fmt = (d: string | Date) => new Date(d).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

type CardBlock = Extract<Block, { type: "card" }>;

function BillCard({ data, currency }: { data: any; currency: string }) {
  const { bill, lines, insights } = data as { bill: { payee: string; totalMinor: number; dueOn: string | null; id: string }; lines: { description: string; quantity: number; amountMinor: number }[]; insights: BillInsights };
  const risk = insights.dueRisk.find((r) => r.billId === bill.id);
  const anomaly = insights.anomalies.find((a) => a.billId === bill.id);
  const max = Math.max(...insights.monthlyTrend.map((m) => m.totalMinor), 1);
  return (<>
    <div className="display">{money(bill.totalMinor, currency)}</div>
    {risk && <span className={`badge ${risk.daysLeft < 0 ? "danger" : risk.daysLeft <= 3 ? "warning" : "positive"}`}>
      {risk.daysLeft < 0 ? `Overdue ${-risk.daysLeft}d` : `Due in ${risk.daysLeft} days`}</span>}
    <div className="lines">{lines.map((l, i) => <div key={i}><span>{l.quantity > 1 ? `${l.quantity}× ` : ""}{l.description}</span><span>{money(l.amountMinor, currency)}</span></div>)}</div>
    {anomaly && <div className="flag">{money(anomaly.totalMinor, currency)} is well above your usual {money(anomaly.typicalMinor, currency)} for {anomaly.payee}.</div>}
    {insights.monthlyTrend.length > 1 && <div className="trend" aria-label="Monthly spend trend">
      {insights.monthlyTrend.map((m) => <div key={m.month}><i style={{ height: `${(m.totalMinor / max) * 100}%` }} /><span>{m.month.slice(5)}</span></div>)}
    </div>}
  </>);
}

export function DigestBody({ d, currency }: { d: Digest; currency: string }) {
  const pct = d.spend.budgetMinor ? Math.round((d.spend.monthMinor / d.spend.budgetMinor) * 100) : null;
  return (<>
    {pct !== null && <div className="display">{pct}%<span className="meta"> of budget used</span></div>}
    {d.conflicts.length === 0 && <div className="body">Nothing is fighting for your time or money this week.</div>}
    {d.conflicts.map((c, i) => <div key={i} className="flag">{c.message}</div>)}
    <div className="meta">{d.weekEvents} events this week · {d.bills.length} unpaid bills · spent {money(d.spend.monthMinor, currency)}</div>
  </>);
}

export function Card({ block, currency }: { block: CardBlock; currency: string }) {
  const d = block.data as any;
  return (
    <div className="card">
      <div className="title">{block.title}</div>
      {block.variant === "bill" && <BillCard data={d} currency={currency} />}
      {block.variant === "digest" && <>{d.narrative && <div className="body">{d.narrative}</div>}<DigestBody d={d.digest} currency={currency} /></>}
      {block.variant === "workout" && <div className="lines">{(d as any[]).map((w) => <div key={w.id}><span>{w.title}</span><span>{fmt(w.plannedAt)} · {w.durationMin} min</span></div>)}</div>}
      {block.variant === "events" && <div className="lines">{(d as any[]).map((e) => <div key={e.id}><span>{e.title}</span><span>{fmt(e.startsAt)}</span></div>)}</div>}
    </div>
  );
}

export function ApprovalChips({ block, onResolve }: { block: Extract<Block, { type: "approval" }>; onResolve: (id: string, d: "yes" | "no") => void }) {
  const done = block.status !== "pending";
  return (
    <div className="card">
      <div className="title">{block.summary}</div>
      {done
        ? <div className={`resolved ${block.status}`}>{block.status === "approved" ? "✓ Done" : block.status === "declined" ? "Declined" : "Couldn't complete this"}</div>
        : <div className="chips">
            <button className="chip yes" onClick={() => onResolve(block.approvalId, "yes")}>Yes</button>
            <button className="chip no" onClick={() => onResolve(block.approvalId, "no")}>No</button>
          </div>}
    </div>
  );
}
