import { z } from "zod";
import type { Db } from "@/db/client";
import type { Block } from "./blocks";

export type ToolContext = { db: Db; userId: string; now: Date };
export type ToolResult = { text: string; blocks?: Block[] };

/**
 * `read`: runs immediately (reads, or reversible writes to our own context store).
 * `consequential`: affects the outside world or money. The agent loop NEVER runs it; it queues an approval,
 * and only resolveApproval() — triggered by a chip tap — calls execute().
 */
export type Tool<S extends z.ZodType = z.ZodType> = {
  name: string;
  description: string;
  kind: "read" | "consequential";
  schema: S;
  /** Consequential only: one-line human summary shown on the approval card. */
  summarize?: (input: z.infer<S>) => string;
  execute: (ctx: ToolContext, input: z.infer<S>) => Promise<ToolResult>;
};

export const defineTool = <S extends z.ZodType>(t: Tool<S>) => t as unknown as Tool;
