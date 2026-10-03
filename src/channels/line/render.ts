import type { messagingApi } from "@line/bot-sdk";
import type { Block } from "@/agent/blocks";

type Msg = messagingApi.Message;
const EMBER = "#C8602A", SAGE = "#3E9F6B"; // ember (action) / agent tint, approximated from DESIGN.MD oklch tokens
const SENDER = { name: "Desker" };
const money = (minor: number, cur = "THB") => new Intl.NumberFormat("en", { style: "currency", currency: cur }).format(minor / 100);

const text = (t: string): Msg => ({ type: "text", text: t.slice(0, 4900), sender: SENDER });
const row = (l: string, r: string) => ({ type: "box" as const, layout: "horizontal" as const, contents: [
  { type: "text" as const, text: l, size: "sm", flex: 3, wrap: true }, { type: "text" as const, text: r, size: "sm", align: "end" as const, flex: 2 }] });

function bubble(title: string, body: messagingApi.FlexComponent[], footer?: messagingApi.FlexComponent[]): messagingApi.FlexBubble {
  return {
    type: "bubble",
    styles: { body: { backgroundColor: "#FFFEFB" }, footer: { backgroundColor: "#FFFEFB" } },
    body: { type: "box", layout: "horizontal", spacing: "md", contents: [
      { type: "box", layout: "vertical", width: "3px", backgroundColor: SAGE, contents: [] }, // agent tint bar
      { type: "box", layout: "vertical", spacing: "sm", flex: 1, contents: [{ type: "text", text: title, weight: "bold", size: "md", wrap: true }, ...body] }] },
    ...(footer && { footer: { type: "box", layout: "horizontal", spacing: "md", contents: footer } }),
  };
}
const flex = (alt: string, b: messagingApi.FlexBubble): Msg => ({ type: "flex", altText: alt.slice(0, 390), contents: b, sender: SENDER });

export function renderCard(b: Extract<Block, { type: "card" }>): Msg {
  const d = b.data as any;
  if (b.variant === "bill") {
    const { bill, lines, insights } = d;
    const risk = insights.dueRisk.find((r: any) => r.billId === bill.id);
    const anomaly = insights.anomalies.find((a: any) => a.billId === bill.id);
    return flex(`${b.title} ${money(bill.totalMinor)}`, bubble(b.title, [
      { type: "text", text: money(bill.totalMinor), size: "xxl", weight: "bold" },
      ...(risk ? [{ type: "text" as const, text: risk.daysLeft < 0 ? `Overdue ${-risk.daysLeft}d` : `Due in ${risk.daysLeft} days`, size: "xs", color: risk.daysLeft <= 3 ? "#A56A00" : "#2F7A55" }] : []),
      ...lines.map((l: any) => row(l.description, money(l.amountMinor))),
      ...(anomaly ? [{ type: "text" as const, text: `Higher than your usual ${money(anomaly.typicalMinor)}`, size: "xs", color: "#8A3A12", wrap: true }] : []),
    ]));
  }
  if (b.variant === "digest") {
    const dg = d.digest;
    return flex(b.title, bubble(b.title, [
      ...(d.narrative ? [{ type: "text" as const, text: d.narrative, size: "sm", wrap: true }] : []),
      ...(dg.conflicts.length ? dg.conflicts.map((c: any) => ({ type: "text" as const, text: `• ${c.message}`, size: "sm", wrap: true })) : [{ type: "text" as const, text: "All clear this week.", size: "sm" }]),
    ]));
  }
  const items: any[] = Array.isArray(d) ? d : [];
  return flex(b.title, bubble(b.title, items.map((i) => row(i.title, new Date(i.plannedAt ?? i.startsAt).toLocaleString("en", { weekday: "short", hour: "numeric", minute: "2-digit" })))));
}

/** Approval chips are Flex buttons that postback "yes:<id>" / "no:<id>". Resolved cards drop the buttons. */
export function renderApproval(b: Extract<Block, { type: "approval" }>): Msg {
  const resolved = b.status !== "pending";
  const label = b.status === "approved" ? "✓ Done" : b.status === "declined" ? "Declined" : "Couldn't complete this";
  return flex(b.summary, bubble(b.summary, resolved ? [{ type: "text", text: label, size: "sm", color: "#6B6258" }] : [], resolved ? undefined : [
    { type: "button", style: "primary", color: EMBER, height: "sm", action: { type: "postback", label: "Yes", data: `yes:${b.approvalId}`, displayText: "Yes" } },
    { type: "button", style: "secondary", height: "sm", action: { type: "postback", label: "No", data: `no:${b.approvalId}`, displayText: "No" } },
  ]));
}

export function renderBlocks(blocks: Block[]): Msg[] {
  return blocks.map((b) => (b.type === "text" ? text(b.text) : b.type === "card" ? renderCard(b) : renderApproval(b))).slice(0, 5); // LINE: max 5 per call
}
