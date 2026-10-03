import { WebClient } from "@slack/web-api";
import { GOOGLE_SCOPES, oauthClient } from "@/integrations/google";
import { authorizeUrl as outlookUrl, exchangeCode } from "@/integrations/outlook";
import { saveTokens } from "@/integrations/connections";

const app = () => process.env.APP_URL!;

export const providers = {
  google: {
    url: (state: string) => oauthClient().generateAuthUrl({ access_type: "offline", prompt: "consent", scope: GOOGLE_SCOPES, state }),
    finish: async (userId: string, code: string) => saveTokens(userId, "google", (await oauthClient().getToken(code)).tokens as Record<string, unknown>),
  },
  outlook: {
    url: outlookUrl,
    finish: async (userId: string, code: string) => { const t = await exchangeCode(code); await saveTokens(userId, "outlook", { ...t, expires_at: Date.now() + t.expires_in * 1000 }); },
  },
  slack: {
    url: (state: string) => `https://slack.com/oauth/v2/authorize?${new URLSearchParams({ client_id: process.env.SLACK_CLIENT_ID!, user_scope: "chat:write,channels:history,groups:history,im:history,channels:read", redirect_uri: `${app()}/api/oauth/slack/callback`, state })}`,
    finish: async (userId: string, code: string) => {
      const r = await new WebClient().oauth.v2.access({ client_id: process.env.SLACK_CLIENT_ID!, client_secret: process.env.SLACK_CLIENT_SECRET!, code, redirect_uri: `${app()}/api/oauth/slack/callback` });
      await saveTokens(userId, "slack", { access_token: r.authed_user?.access_token });
    },
  },
} as const;
export type ProviderName = keyof typeof providers;
