import { z } from "zod";
import { gmail, slack } from "@/integrations";
import { defineTool } from "../tool";

export const searchEmail = defineTool({
  name: "search_email", kind: "read",
  description: "Search the user's Gmail (Gmail search syntax, e.g. 'is:unread from:bank newer_than:7d'). Use to find bills, receipts, confirmations.",
  schema: z.object({ query: z.string(), max: z.number().int().min(1).max(20).default(10) }),
  async execute({ userId }, i) { return { text: JSON.stringify(await gmail.search(userId, i.query, i.max)) }; },
});

export const readSlack = defineTool({
  name: "read_slack", kind: "read",
  description: "Read recent messages from a Slack channel id.",
  schema: z.object({ channel: z.string(), limit: z.number().int().min(1).max(50).default(20) }),
  async execute({ userId }, i) { return { text: JSON.stringify(await slack.history(userId, i.channel, i.limit)) }; },
});
