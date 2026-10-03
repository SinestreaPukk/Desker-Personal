import { randomInt } from "node:crypto";
import { db } from "@/db/client";
import { linkCodes } from "@/db/schema";
import { asResponse, requireUser } from "@/app/session";

/** Web side of account linking: returns a 6-digit code to send to the LINE OA as "link 123456". */
export async function POST() {
  try {
    const userId = await requireUser();
    const code = String(randomInt(100000, 1000000));
    await db.insert(linkCodes).values({ code, userId, expiresAt: new Date(Date.now() + 10 * 60_000) });
    return Response.json({ code });
  } catch (e) { return asResponse(e); }
}
