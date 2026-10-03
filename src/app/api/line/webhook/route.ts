import { validateSignature, type webhook } from "@line/bot-sdk";
import { and, eq, gt } from "drizzle-orm";
import { resolveApproval } from "@/agent/approvals";
import { handleMessage } from "@/agent/handleMessage";
import { line } from "@/channels/line/client";
import { renderBlocks } from "@/channels/line/render";
import { db } from "@/db/client";
import { linkCodes, users } from "@/db/schema";

async function userFor(lineUserId: string) {
  const [u] = await db.select().from(users).where(eq(users.lineUserId, lineUserId));
  if (u) return u.id;
  const [n] = await db.insert(users).values({ name: "Friend", lineUserId }).returning();
  return n!.id;
}

async function handle(e: webhook.Event) {
  const lineUserId = e.source?.userId;
  if (!lineUserId) return;
  const reply = async (messages: ReturnType<typeof renderBlocks>) => {
    const replyToken = "replyToken" in e ? e.replyToken : undefined;
    try {
      if (!replyToken) throw new Error("no reply token");
      await line.replyMessage({ replyToken, messages });
    } catch { await line.pushMessage({ to: lineUserId, messages }); } // reply token expires after ~1 min of agent work
  };

  if (e.type === "follow") return reply([{ type: "text", text: "Hi, I'm Desker. Tell me what's going on, or ask me anything." }]);

  if (e.type === "postback") {
    const [decision, id] = e.postback.data.split(":");
    if ((decision !== "yes" && decision !== "no") || !id) return;
    return reply(renderBlocks([await resolveApproval(db, await userFor(lineUserId), id, decision)]));
  }

  if (e.type === "message" && e.message.type === "text") {
    const text = e.message.text.trim();
    const m = /^link (\d{6})$/i.exec(text);
    if (m) { // attach this LINE account to the web user who generated the code
      const [c] = await db.select().from(linkCodes).where(and(eq(linkCodes.code, m[1]!), gt(linkCodes.expiresAt, new Date())));
      if (!c) return reply([{ type: "text", text: "That code didn't work or has expired. Generate a new one in the app." }]);
      await db.update(users).set({ lineUserId }).where(eq(users.id, c.userId));
      await db.delete(linkCodes).where(eq(linkCodes.code, c.code));
      return reply([{ type: "text", text: "Linked. Same thread, same context, here and in the app." }]);
    }
    return reply(renderBlocks(await handleMessage(db, await userFor(lineUserId), "line", text)));
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  if (!validateSignature(body, process.env.LINE_CHANNEL_SECRET ?? "", req.headers.get("x-line-signature") ?? "")) return new Response("bad signature", { status: 401 });
  const { events } = JSON.parse(body) as { events: webhook.Event[] };
  // Process after acking would need a queue; awaiting keeps it simple and within LINE's timeout for typical turns.
  await Promise.allSettled(events.map(handle));
  return new Response("ok");
}
