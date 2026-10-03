import { and, eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { approvals, auditLog } from "@/db/schema";
import type { ApprovalBlock } from "./blocks";
import { toolsByName } from "./tools";

export async function requestApproval(db: Db, userId: string, toolName: string, input: unknown, summary: string): Promise<ApprovalBlock> {
  const [row] = await db.insert(approvals).values({ userId, action: toolName, payload: input, summary }).returning();
  await db.insert(auditLog).values({ userId, actor: "agent", action: "approval.requested", detail: { approvalId: row!.id, toolName, input } });
  return { type: "approval", approvalId: row!.id, summary, status: "pending" };
}

/** The ONLY path that executes a consequential tool. Idempotent: a second tap on a resolved card is a no-op. */
export async function resolveApproval(db: Db, userId: string, approvalId: string, decision: "yes" | "no"): Promise<ApprovalBlock> {
  // Claim the row atomically so double-taps (app + LINE) can't double-execute.
  const [claimed] = await db.update(approvals)
    .set({ status: decision === "yes" ? "approved" : "declined", resolvedAt: new Date() })
    .where(and(eq(approvals.id, approvalId), eq(approvals.userId, userId), eq(approvals.status, "pending")))
    .returning();
  if (!claimed) {
    const [existing] = await db.select().from(approvals).where(and(eq(approvals.id, approvalId), eq(approvals.userId, userId)));
    if (!existing) throw new Error("approval not found");
    return { type: "approval", approvalId, summary: existing.summary, status: existing.status as never };
  }
  await db.insert(auditLog).values({ userId, actor: "user", action: `approval.${decision === "yes" ? "approved" : "declined"}`, detail: { approvalId } });
  if (decision === "no") return { type: "approval", approvalId, summary: claimed.summary, status: "declined" };

  const tool = toolsByName[claimed.action];
  try {
    if (!tool) throw new Error(`unknown tool ${claimed.action}`);
    const result = await tool.execute({ db, userId, now: new Date() }, tool.schema.parse(claimed.payload));
    await db.update(approvals).set({ result }).where(eq(approvals.id, approvalId));
    await db.insert(auditLog).values({ userId, actor: "system", action: "approval.executed", detail: { approvalId, result } });
    return { type: "approval", approvalId, summary: claimed.summary, status: "approved" };
  } catch (e) {
    await db.update(approvals).set({ status: "failed", result: { error: String(e) } }).where(eq(approvals.id, approvalId));
    await db.insert(auditLog).values({ userId, actor: "system", action: "approval.failed", detail: { approvalId, error: String(e) } });
    return { type: "approval", approvalId, summary: claimed.summary, status: "failed" };
  }
}
