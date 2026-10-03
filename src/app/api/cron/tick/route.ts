import { timingSafeEqual } from "node:crypto";
import { db } from "@/db/client";
import { notify } from "@/channels/notify";
import { users } from "@/db/schema";
import { runAlertsForAll } from "@/jobs/alerts";
import { syncCalendars } from "@/jobs/calendarSync";
import { runWeeklyDigests } from "@/jobs/weeklyDigest";

export const maxDuration = 60;

/** The scheduler hits this every minute (see README). Replaces a worker process: reminders, alerts, calendar sync, Monday digest. */
export async function GET(req: Request) {
  const given = Buffer.from(req.headers.get("authorization") ?? ""), want = Buffer.from(`Bearer ${process.env.CRON_SECRET}`);
  if (!process.env.CRON_SECRET || given.length !== want.length || !timingSafeEqual(given, want)) return new Response("unauthorized", { status: 401 });

  await runAlertsForAll(db, (userId, blocks) => notify(db, userId, blocks));
  await runWeeklyDigests(db);
  const minute = new Date().getUTCMinutes();
  if (minute % 5 === 0) for (const u of await db.select({ id: users.id }).from(users)) await syncCalendars(db, u.id).catch((e) => console.error("sync failed", u.id, e));
  return new Response("ok");
}
