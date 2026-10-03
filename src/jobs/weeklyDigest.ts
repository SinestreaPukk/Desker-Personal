import Anthropic from "@anthropic-ai/sdk";
import { and, eq, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { getSnapshot } from "@/context/snapshot";
import { auditLog, users } from "@/db/schema";
import { buildDigest } from "@/reasoning/digest";
import { notify } from "@/channels/notify";

const client = new Anthropic();

/** Monday 08:00 in the user's timezone, once per week. Structured digest from the engine + a short narrative from Claude. */
export async function runWeeklyDigests(db: Db, now = new Date()) {
  for (const u of await db.select().from(users)) {
    const local = new Intl.DateTimeFormat("en-US", { timeZone: u.timezone, weekday: "short", hour: "numeric", hour12: false, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const p = Object.fromEntries(local.map((x) => [x.type, x.value]));
    if (p.weekday !== "Mon" || p.hour !== "08") continue;
    const key = `digest:${p.year}-${p.month}-${p.day}`;
    const [seen] = await db.select({ id: auditLog.id }).from(auditLog).where(and(eq(auditLog.userId, u.id), sql`${auditLog.detail}->>'key' = ${key}`)).limit(1);
    if (seen) continue;

    const digest = buildDigest(await getSnapshot(db, u.id, now));
    let narrative: string | undefined;
    try {
      const r = await client.messages.create({
        model: "claude-sonnet-5-5", max_tokens: 400,
        system: "You are Desker, a warm personal assistant. Write a 3-4 sentence Monday brief for the user from this week's data. Name the real trade-offs across money, calendar, bills and fitness and recommend one thing to do first. No headings, no lists.",
        messages: [{ role: "user", content: JSON.stringify(digest) }],
      });
      narrative = r.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n") || undefined;
    } catch (e) { console.error("digest narrative failed", e); } // still send the structured card
    await notify(db, u.id, [{ type: "card", variant: "digest", title: "Your week", data: { narrative, digest } }]);
    await db.insert(auditLog).values({ userId: u.id, actor: "system", action: "alert.sent", detail: { key } });
  }
}
