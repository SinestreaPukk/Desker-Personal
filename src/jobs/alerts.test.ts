import { eq } from "drizzle-orm";
import { afterAll, expect, test } from "vitest";
import { db } from "@/db/client";
import { bills, tasks, users } from "@/db/schema";
import { runAlerts } from "./alerts";

const [user] = await db.insert(users).values({ name: "Alerts" }).returning();
const uid = user!.id;
afterAll(async () => { await db.delete(users).where(eq(users.id, uid)); });

test("reminder and due-bill alert fire once, not on every tick", async () => {
  const now = new Date("2026-10-03T08:00:00Z");
  await db.insert(tasks).values({ userId: uid, title: "Call mum", remindAt: new Date("2026-10-03T07:59:00Z") });
  await db.insert(bills).values({ userId: uid, payee: "Electric", totalMinor: 120000, issuedOn: "2026-10-01", dueOn: "2026-10-05" });

  const sent: string[] = [];
  const notify = async (_: string, b: any[]) => { sent.push(b[0].text); };
  await runAlerts(db, uid, notify, now);
  await runAlerts(db, uid, notify, new Date(now.getTime() + 60_000));

  expect(sent.filter((s) => s.includes("Call mum"))).toHaveLength(1);
  expect(sent.filter((s) => s.includes("Electric"))).toHaveLength(1);
});
