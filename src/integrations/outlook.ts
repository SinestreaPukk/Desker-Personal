import { getTokens, saveTokens } from "./connections";
import type { CalendarEventInput } from "./outbound";

const TENANT = "common";
export const OUTLOOK_SCOPES = "offline_access Calendars.ReadWrite";
export const authorizeUrl = (state: string) =>
  `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize?${new URLSearchParams({ client_id: process.env.MS_CLIENT_ID!, response_type: "code", redirect_uri: `${process.env.APP_URL}/api/oauth/outlook/callback`, scope: OUTLOOK_SCOPES, state })}`;

async function token(body: Record<string, string>) {
  const r = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, { method: "POST", body: new URLSearchParams({ client_id: process.env.MS_CLIENT_ID!, client_secret: process.env.MS_CLIENT_SECRET!, ...body }) });
  if (!r.ok) throw new Error(`outlook token: ${await r.text()}`);
  return r.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}
export const exchangeCode = (code: string) => token({ grant_type: "authorization_code", code, redirect_uri: `${process.env.APP_URL}/api/oauth/outlook/callback`, scope: OUTLOOK_SCOPES });

async function graph(userId: string, path: string, init: RequestInit = {}) {
  const t = await getTokens(userId, "outlook") as { access_token: string; refresh_token: string; expires_at: number } | null;
  if (!t) throw new Error("Outlook is not connected");
  let access = t.access_token;
  if (Date.now() > t.expires_at - 60_000) { // refresh
    const n = await token({ grant_type: "refresh_token", refresh_token: t.refresh_token, scope: OUTLOOK_SCOPES });
    access = n.access_token;
    await saveTokens(userId, "outlook", { ...n, expires_at: Date.now() + n.expires_in * 1000 });
  }
  const r = await fetch(`https://graph.microsoft.com/v1.0${path}`, { ...init, headers: { authorization: `Bearer ${access}`, "content-type": "application/json", ...init.headers } });
  if (!r.ok) throw new Error(`graph ${path}: ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}
const when = (d: Date) => ({ dateTime: d.toISOString().replace("Z", ""), timeZone: "UTC" });

export const outlookCalendar = {
  async create(userId: string, e: CalendarEventInput) {
    if (!(await getTokens(userId, "outlook"))) return null;
    const r = await graph(userId, "/me/events", { method: "POST", body: JSON.stringify({ subject: e.title, start: when(e.startsAt), end: when(e.endsAt) }) });
    return { externalId: r.id as string, source: "outlook" };
  },
  update: (userId: string, id: string, e: Partial<CalendarEventInput>) =>
    graph(userId, `/me/events/${id}`, { method: "PATCH", body: JSON.stringify({ ...(e.title && { subject: e.title }), ...(e.startsAt && { start: when(e.startsAt) }), ...(e.endsAt && { end: when(e.endsAt) }) }) }),
  remove: (userId: string, id: string) => graph(userId, `/me/events/${id}`, { method: "DELETE" }),
  async upcoming(userId: string) {
    const r = await graph(userId, `/me/calendarView?startDateTime=${new Date().toISOString()}&endDateTime=${new Date(Date.now() + 14 * 864e5).toISOString()}&$top=100`);
    return r.value as { id: string; subject: string; start: { dateTime: string }; end: { dateTime: string } }[];
  },
};
