import { z } from "zod";
import { resolveApproval } from "@/agent/approvals";
import { db } from "@/db/client";
import { asResponse, requireUser } from "@/app/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser();
    const { decision } = z.object({ decision: z.enum(["yes", "no"]) }).parse(await req.json());
    return Response.json({ block: await resolveApproval(db, userId, (await params).id, decision) });
  } catch (e) { return asResponse(e); }
}
