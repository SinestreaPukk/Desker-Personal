import { z } from "zod";
import { isConnected } from "@/integrations/connections";
import { defineTool } from "../tool";

export const connectionLinks = defineTool({
  name: "connection_status", kind: "read",
  description: "Show which accounts are connected (Google calendar+Gmail, Outlook calendar, Slack) with a link to connect the missing ones. Use when an action needs an account that isn't connected, or the user asks to connect something.",
  schema: z.object({}),
  async execute({ userId }) {
    const base = process.env.APP_URL ?? "";
    const out = await Promise.all((["google", "outlook", "slack"] as const).map(async (p) => ({ provider: p, connected: await isConnected(userId, p), connectUrl: `${base}/api/oauth/${p}/start` })));
    return { text: JSON.stringify(out) };
  },
});
