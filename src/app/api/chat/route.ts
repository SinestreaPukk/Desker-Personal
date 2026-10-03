import { z } from "zod";
import { handleMessage } from "@/agent/handleMessage";
import { db } from "@/db/client";
import { asResponse, requireUser } from "@/app/session";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const userId = await requireUser();
    const { text } = z.object({ text: z.string().min(1).max(4000) }).parse(await req.json());
    return Response.json({ blocks: await handleMessage(db, userId, "web", text) });
  } catch (e) { return asResponse(e); }
}
