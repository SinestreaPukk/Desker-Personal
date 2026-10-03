import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { events } from "@/db/schema";
import { outbound } from "@/integrations";
import { defineTool } from "../tool";

const when = z.string().datetime({ offset: true });

export const createEvent = defineTool({
  name: "create_event", kind: "consequential",
  description: "Add an event, meeting, deadline or travel block to the user's calendar (synced to Google/Outlook).",
  schema: z.object({ title: z.string(), startsAt: when, endsAt: when, kind: z.enum(["event", "meeting", "deadline", "travel"]).default("event"), costMinor: z.number().int().optional() }),
  summarize: (i) => `Add "${i.title}" on ${i.startsAt}`,
  async execute({ db, userId }, i) {
    const startsAt = new Date(i.startsAt), endsAt = new Date(i.endsAt);
    const ext = await outbound.createCalendarEvent(userId, { title: i.title, startsAt, endsAt });
    await db.insert(events).values({ userId, title: i.title, startsAt, endsAt, kind: i.kind, costMinor: i.costMinor, source: ext?.source ?? "local", externalId: ext?.externalId });
    return { text: `Added "${i.title}"` };
  },
});

export const moveEvent = defineTool({
  name: "move_event", kind: "consequential",
  description: "Reschedule an existing event by id.",
  schema: z.object({ eventId: z.string().uuid(), startsAt: when, endsAt: when }),
  summarize: (i) => `Move event to ${i.startsAt}`,
  async execute({ db, userId }, i) {
    const [e] = await db.select().from(events).where(and(eq(events.id, i.eventId), eq(events.userId, userId)));
    if (!e) throw new Error("event not found");
    const startsAt = new Date(i.startsAt), endsAt = new Date(i.endsAt);
    if (e.externalId) await outbound.updateCalendarEvent(userId, e.source, e.externalId, { startsAt, endsAt });
    await db.update(events).set({ startsAt, endsAt }).where(eq(events.id, e.id));
    return { text: `Moved "${e.title}"` };
  },
});

export const cancelEvent = defineTool({
  name: "cancel_event", kind: "consequential",
  description: "Cancel (delete) an event by id.",
  schema: z.object({ eventId: z.string().uuid() }),
  summarize: () => "Cancel an event",
  async execute({ db, userId }, i) {
    const [e] = await db.select().from(events).where(and(eq(events.id, i.eventId), eq(events.userId, userId)));
    if (!e) throw new Error("event not found");
    if (e.externalId) await outbound.deleteCalendarEvent(userId, e.source, e.externalId);
    await db.delete(events).where(eq(events.id, e.id));
    return { text: `Cancelled "${e.title}"` };
  },
});
