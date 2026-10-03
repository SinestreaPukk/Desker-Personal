import { google } from "googleapis";
import { getTokens, saveTokens } from "./connections";
import type { CalendarEventInput } from "./outbound";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/gmail.modify",
];

export const oauthClient = () =>
  new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.APP_URL}/api/oauth/google/callback`);

async function authFor(userId: string) {
  const tokens = await getTokens(userId, "google");
  if (!tokens) return null;
  const c = oauthClient();
  c.setCredentials(tokens);
  c.on("tokens", (t) => saveTokens(userId, "google", { ...tokens, ...t })); // persist refreshed access tokens
  return c;
}
const need = async (userId: string) => (await authFor(userId)) ?? Promise.reject(new Error("Google is not connected"));

export const googleCalendar = {
  async create(userId: string, e: CalendarEventInput) {
    const auth = await authFor(userId); if (!auth) return null;
    const r = await google.calendar({ version: "v3", auth }).events.insert({ calendarId: "primary", requestBody: { summary: e.title, start: { dateTime: e.startsAt.toISOString() }, end: { dateTime: e.endsAt.toISOString() } } });
    return { externalId: r.data.id!, source: "google" };
  },
  async update(userId: string, id: string, e: Partial<CalendarEventInput>) {
    await google.calendar({ version: "v3", auth: await need(userId) }).events.patch({ calendarId: "primary", eventId: id, requestBody: {
      ...(e.title && { summary: e.title }), ...(e.startsAt && { start: { dateTime: e.startsAt.toISOString() } }), ...(e.endsAt && { end: { dateTime: e.endsAt.toISOString() } }) } });
  },
  async remove(userId: string, id: string) {
    await google.calendar({ version: "v3", auth: await need(userId) }).events.delete({ calendarId: "primary", eventId: id });
  },
  /** Incremental sync for the context layer. Returns events plus the cursor for next time. */
  async sync(userId: string, cursor: string | null) {
    const cal = google.calendar({ version: "v3", auth: await need(userId) });
    const r = await cal.events.list({ calendarId: "primary", singleEvents: true, ...(cursor ? { syncToken: cursor } : { timeMin: new Date().toISOString(), maxResults: 250 }) });
    return { items: r.data.items ?? [], cursor: r.data.nextSyncToken ?? cursor };
  },
};

const b64 = (s: string) => Buffer.from(s).toString("base64url");
export const gmail = {
  async send(userId: string, to: string, subject: string, body: string) {
    const raw = b64(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`);
    await google.gmail({ version: "v1", auth: await need(userId) }).users.messages.send({ userId: "me", requestBody: { raw } });
  },
  /** Read the inbox on the user's behalf: sender, subject, snippet, plus plain-text body trimmed. */
  async search(userId: string, query: string, max = 10) {
    const g = google.gmail({ version: "v1", auth: await need(userId) });
    const list = await g.users.messages.list({ userId: "me", q: query, maxResults: max });
    return Promise.all((list.data.messages ?? []).map(async (m) => {
      const r = await g.users.messages.get({ userId: "me", id: m.id!, format: "metadata", metadataHeaders: ["From", "Subject", "Date"] });
      const h = (n: string) => r.data.payload?.headers?.find((x) => x.name === n)?.value ?? "";
      return { id: m.id!, from: h("From"), subject: h("Subject"), date: h("Date"), snippet: r.data.snippet ?? "" };
    }));
  },
};
