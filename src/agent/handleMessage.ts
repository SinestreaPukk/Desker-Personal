import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Db } from "@/db/client";
import { getSnapshot } from "@/context/snapshot";
import { messages } from "@/db/schema";
import { requestApproval } from "./approvals";
import type { Block } from "./blocks";
import { systemPrompt } from "./prompt";
import { tools, toolsByName } from "./tools";

const MODEL = "claude-sonnet-5-5";
const MAX_STEPS = 8;
const client = new Anthropic();

const toolDefs: Anthropic.Messages.ToolUnion[] = [
  ...tools.map((t) => ({
    name: t.name,
    description: t.kind === "consequential" ? `${t.description} (Needs the user's approval; it is queued, not run.)` : t.description,
    input_schema: z.toJSONSchema(t.schema) as Anthropic.Messages.Tool.InputSchema,
  })),
  { type: "web_search_20250305", name: "web_search", max_uses: 5 },
];

const textOf = (blocks: unknown[]) => (blocks as Block[]).map((b) => (b.type === "text" ? b.text : b.type === "approval" ? `[proposed: ${b.summary}]` : `[card: ${b.type}]`)).join("\n");

/** THE entry point. The web API route and the LINE webhook both call this and nothing else. */
export async function handleMessage(db: Db, userId: string, channel: "web" | "line", text: string, now = new Date()): Promise<Block[]> {
  const snap = await getSnapshot(db, userId, now);
  await db.insert(messages).values({ userId, role: "user", channel, blocks: [{ type: "text", text }] });

  // History as alternating user/agent turns (consecutive same-role turns merged).
  const convo: Anthropic.Messages.MessageParam[] = [];
  for (const m of [...snap.recentMessages, { role: "user" as const, blocks: [{ type: "text", text }] }]) {
    const role = m.role === "user" ? "user" : "assistant";
    const content = textOf(m.blocks);
    const last = convo.at(-1);
    if (last && last.role === role) last.content += `\n${content}`;
    else convo.push({ role, content });
  }
  while (convo[0]?.role === "assistant") convo.shift();

  const out: Block[] = [];
  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await client.messages.create({ model: MODEL, max_tokens: 2048, system: systemPrompt(snap), tools: toolDefs, messages: convo });
    for (const b of res.content) if (b.type === "text" && b.text.trim()) out.push({ type: "text", text: b.text });
    convo.push({ role: "assistant", content: res.content });
    if (res.stop_reason === "pause_turn") continue; // server-side web search still running
    if (res.stop_reason !== "tool_use") break;

    const results: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const b of res.content) {
      if (b.type !== "tool_use") continue;
      const tool = toolsByName[b.name];
      let content: string;
      try {
        if (!tool) throw new Error(`unknown tool ${b.name}`);
        const input = tool.schema.parse(b.input);
        if (tool.kind === "consequential") {
          out.push(await requestApproval(db, userId, tool.name, input, tool.summarize?.(input) ?? tool.name));
          content = "Queued for the user's approval. It has NOT happened yet. Tell the user you've proposed it.";
        } else {
          const r = await tool.execute({ db, userId, now }, input);
          out.push(...(r.blocks ?? []));
          content = r.text;
        }
      } catch (e) {
        results.push({ type: "tool_result", tool_use_id: b.id, content: `Error: ${e instanceof Error ? e.message : e}`, is_error: true });
        continue;
      }
      results.push({ type: "tool_result", tool_use_id: b.id, content });
    }
    convo.push({ role: "user", content: results });
  }

  if (!out.length) out.push({ type: "text", text: "Sorry, I couldn't put an answer together. Could you rephrase?" });
  await db.insert(messages).values({ userId, role: "agent", channel, blocks: out });
  return out;
}
