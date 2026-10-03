import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { messages, approvals } from "@/db/schema";
import { asResponse, requireUser } from "@/app/session";

/** Full history; approval blocks get their live status so resolved cards stay resolved after reload. */
export async function GET() {
  try {
    const userId = await requireUser();
    const [rows, apps] = await Promise.all([
      db.select().from(messages).where(eq(messages.userId, userId)).orderBy(asc(messages.createdAt)).limit(200),
      db.select({ id: approvals.id, status: approvals.status }).from(approvals).where(eq(approvals.userId, userId)),
    ]);
    const status = new Map(apps.map((a) => [a.id, a.status]));
    const live = rows.map((m) => ({ ...m, blocks: (m.blocks as any[]).map((b) => (b.type === "approval" ? { ...b, status: status.get(b.approvalId) ?? b.status } : b)) }));
    return Response.json({ messages: live });
  } catch (e) { return asResponse(e); }
}
