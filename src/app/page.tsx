"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Block } from "@/agent/blocks";
import type { Digest } from "@/reasoning/digest";
import { ApprovalChips, Card, DigestBody } from "./Cards";
import { Today } from "./Today";

type Msg = { id: string; role: "user" | "agent"; blocks: Block[] };
const MENU = [
  ["📅", "Today", "What's on my plate today?"],
  ["🧾", "Add a bill", "I want to add a bill: "],
  ["✈️", "Plan a trip", "Help me plan a trip: "],
  ["💪", "Workout plan", "Plan my workouts for this week"],
  ["💰", "Budget", "Show my budget this month"],
  ["🗓️", "My week", "Show my week"],
  ["🔎", "Look something up", "Look up: "],
] as const;

export default function Page() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [digest, setDigest] = useState<Digest | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const currency = "THB"; // ponytail: from user profile once settings exist

  const refreshToday = useCallback(async () => {
    const d = await fetch("/api/today");
    if (d.ok) setDigest(await d.json());
  }, []);

  const load = useCallback(async () => {
    const t = await fetch("/api/thread");
    if (t.status === 401) return setSignedIn(false);
    setSignedIn(true);
    setMsgs((await t.json()).messages);
    await refreshToday();
  }, [refreshToday]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const push = (m: Omit<Msg, "id">) => setMsgs((p) => [...p, { ...m, id: crypto.randomUUID() }]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setDraft(""); setBusy(true);
    push({ role: "user", blocks: [{ type: "text", text }] });
    try {
      if (signedIn === false) {
        await fetch("/api/session", { method: "POST", body: JSON.stringify({ name: text.trim() }) });
        setSignedIn(true);
        push({ role: "agent", blocks: [{ type: "text", text: `Nice to meet you, ${text.trim()}. Tell me what's going on, or just ask me anything.` }] });
      } else {
        const r = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ text }) });
        push({ role: "agent", blocks: r.ok ? (await r.json()).blocks : [{ type: "text", text: "Something went wrong on my side. Try again?" }] });
        refreshToday();
      }
    } finally { setBusy(false); }
  }

  async function linkLine() {
    const r = await fetch("/api/line/link", { method: "POST" });
    if (!r.ok) return;
    push({ role: "agent", blocks: [{ type: "text", text: `To use me in LINE too, message the Desker account "link ${(await r.json()).code}" within 10 minutes. Same thread, same context.` }] });
  }

  async function resolve(id: string, decision: "yes" | "no") {
    const r = await fetch(`/api/approvals/${id}`, { method: "POST", body: JSON.stringify({ decision }) });
    if (!r.ok) return;
    const { block } = await r.json();
    setMsgs((p) => p.map((m) => ({ ...m, blocks: m.blocks.map((b) => (b.type === "approval" && b.approvalId === id ? block : b)) })));
    refreshToday();
  }

  return (
    <div className="app">
      <div className="col">
        <div className="thread"><div className="thread-inner">
          {digest && <div className="card pinned"><div className="title">Today</div><DigestBody d={digest} currency={currency} /></div>}
          {signedIn === false && <Row first><div className="bubble">Hi, I'm Desker. What should I call you?</div></Row>}
          {msgs.map((m, i) => {
            const first = msgs[i - 1]?.role !== m.role;
            return m.role === "user"
              ? <div key={m.id} className={`row user ${first ? "new-group" : ""}`}><div className="bubble user">{(m.blocks[0] as { text: string }).text}</div></div>
              : m.blocks.map((b, j) => (
                <Row key={`${m.id}${j}`} first={first && j === 0} tight={!(first && j === 0)}>
                  {b.type === "text" && <div className={`bubble ${first && j === 0 ? "" : "tight"}`}>{b.text}</div>}
                  {b.type === "card" && <Card block={b} currency={currency} />}
                  {b.type === "approval" && <ApprovalChips block={b} onResolve={resolve} />}
                </Row>));
          })}
          {busy && <Row first><div className="bubble" aria-live="polite">…</div></Row>}
          <div ref={bottom} />
        </div></div>
        <div className="dock"><div className="dock-inner">
          <div className="menu">{MENU.map(([icon, label, prompt]) => (
            <button key={label} className="tile" onClick={() => (prompt.endsWith(" ") ? setDraft(prompt) : send(prompt))}>{icon} {label}</button>))}
            <button className="tile" onClick={linkLine}>💬 Connect LINE</button></div>
          <form className="composer" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={signedIn === false ? "Your name" : "Ask anything, or tell me what's going on"} aria-label="Message" />
            {draft.trim() && <button className="send" aria-label="Send">↑</button>}
          </form>
        </div></div>
      </div>
      <aside className="rail"><Today d={digest} currency={currency} /></aside>
    </div>
  );
}

/** Agent row: avatar + name on the first bubble of a run, spacer on following ones (Visible Speaker Rule). */
function Row({ children, first, tight }: { children: React.ReactNode; first?: boolean; tight?: boolean }) {
  return (
    <div className={`row ${first ? "new-group" : ""}`}>
      <div className={`avatar ${first || !tight ? "" : "spacer"}`}>D</div>
      <div className="stack">{first && <span className="caption">Desker</span>}{children}</div>
    </div>
  );
}
