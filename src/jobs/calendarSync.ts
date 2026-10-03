import { and, eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { connections, events } from "@/db/schema";
import { isConnected } from "@/integrations/connections";
import { googleCalendar, outlookCalendar } from "@/integrations";

/** Pull external calendar changes into the context layer (the other half of two-way sync; writes go out via tools). */
export async function syncCalendars(db: Db, userId: string) {
  if (await isConnected(userId, "google")) {
    const [conn] = await db.select().from(connections).where(and(eq(connections.userId, userId), eq(connections.provider, "google")));
    const { items, cursor } = await googleCalendar.sync(userId, conn?.syncCursor ?? null);
    for (const e of items) {
      if (!e.id) continue;
      if (e.status === "cancelled") { await db.delete(events).where(and(eq(events.userId, userId), eq(events.source, "google"), eq(events.externalId, e.id))); continue; }
      const start = e.start?.dateTime ?? e.start?.date, end = e.end?.dateTime ?? e.end?.date;
      if (!start || !end) continue;
      const row = { userId, title: e.summary ?? "(no title)", startsAt: new Date(start), endsAt: new Date(end), source: "google", externalId: e.id };
      await db.insert(events).values(row).onConflictDoUpdate({ target: [events.userId, events.source, events.externalId], set: { title: row.title, startsAt: row.startsAt, endsAt: row.endsAt } });
    }
    await db.update(connections).set({ syncCursor: cursor }).where(and(eq(connections.userId, userId), eq(connections.provider, "google")));
  }
  if (await isConnected(userId, "outlook")) {
    for (const e of await outlookCalendar.upcoming(userId)) {
      const row = { userId, title: e.subject, startsAt: new Date(e.start.dateTime + "Z"), endsAt: new Date(e.end.dateTime + "Z"), source: "outlook", externalId: e.id };
      await db.insert(events).values(row).onConflictDoUpdate({ target: [events.userId, events.source, events.externalId], set: { title: row.title, startsAt: row.startsAt, endsAt: row.endsAt } });
    }
  }
}
