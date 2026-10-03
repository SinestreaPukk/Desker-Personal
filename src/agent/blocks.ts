/** What the agent says. Channels render these; nothing else crosses the channel boundary. */
export type Block =
  | { type: "text"; text: string }
  | { type: "card"; variant: "bill" | "digest" | "workout" | "events"; title: string; data: unknown }
  | { type: "approval"; approvalId: string; summary: string; status: "pending" | "approved" | "declined" | "failed" };
export type ApprovalBlock = Extract<Block, { type: "approval" }>;
