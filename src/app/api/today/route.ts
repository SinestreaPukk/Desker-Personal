import { db } from "@/db/client";
import { getSnapshot } from "@/context/snapshot";
import { buildDigest } from "@/reasoning/digest";
import { asResponse, requireUser } from "@/app/session";

export async function GET() {
  try { return Response.json(buildDigest(await getSnapshot(db, await requireUser()))); } catch (e) { return asResponse(e); }
}
