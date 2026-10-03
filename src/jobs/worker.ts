import { PgBoss } from "pg-boss";
import { db } from "@/db/client";
import { notify as send } from "@/channels/notify";
import { syncCalendars } from "./calendarSync";
import { users } from "@/db/schema";
import { runAlertsForAll } from "./alerts";
import { runWeeklyDigests } from "./weeklyDigest";

/** Separate process: `npm run worker`. Postgres-backed scheduling (pg-boss), one tick per minute, singleton across instances. */
const boss = new PgBoss(process.env.DATABASE_URL!);
boss.on("error", console.error);
await boss.start();
await boss.createQueue("tick");
await boss.createQueue("sync");
await boss.schedule("sync", "*/5 * * * *");
await boss.work("sync", async () => {
  for (const u of await db.select({ id: users.id }).from(users)) await syncCalendars(db, u.id).catch((e) => console.error("sync failed", u.id, e));
});
await boss.schedule("tick", "* * * * *");
await boss.work("tick", async () => {
  await runAlertsForAll(db, (userId, blocks) => send(db, userId, blocks));
  await runWeeklyDigests(db);
});
console.log("worker running");
