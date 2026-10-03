import { eq } from "drizzle-orm";
import type { Block } from "@/agent/blocks";
import type { Db } from "@/db/client";
import { messages, users } from "@/db/schema";
import { line, lineEnabled } from "./line/client";
import { renderBlocks } from "./line/render";

/** Proactive alerts. One call: lands in the shared thread (web) and is pushed to LINE, same blocks, same history. */
export async function notify(db: Db, userId: string, blocks: Block[]) {
  await db.insert(messages).values({ userId, role: "agent", channel: "system", blocks });
  const [u] = await db.select({ lineUserId: users.lineUserId }).from(users).where(eq(users.id, userId));
  if (u?.lineUserId && lineEnabled()) await line.pushMessage({ to: u.lineUserId, messages: renderBlocks(blocks) });
}
