import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  const { name } = z.object({ name: z.string().min(1).max(60) }).parse(await req.json());
  const [u] = await db.insert(users).values({ name }).returning();
  const res = Response.json({ id: u!.id });
  res.headers.append("set-cookie", `desker_uid=${u!.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
  return res;
}
