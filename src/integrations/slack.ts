import { WebClient } from "@slack/web-api";
import { getTokens } from "./connections";

async function client(userId: string) {
  const t = await getTokens(userId, "slack") as { access_token?: string } | null;
  if (!t?.access_token) throw new Error("Slack is not connected");
  return new WebClient(t.access_token);
}
export const slack = {
  async send(userId: string, channel: string, text: string) { await (await client(userId)).chat.postMessage({ channel, text }); },
  /** Read recent messages from a channel the user can see. */
  async history(userId: string, channel: string, limit = 20) {
    return ((await (await client(userId)).conversations.history({ channel, limit })).messages ?? []).map((m) => ({ user: m.user, text: m.text, ts: m.ts }));
  },
};
