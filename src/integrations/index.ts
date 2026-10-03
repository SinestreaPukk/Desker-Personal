import { isConnected } from "./connections";
import { gmail, googleCalendar } from "./google";
import { outlookCalendar } from "./outlook";
import type { Outbound } from "./outbound";
import { slack } from "./slack";
import { telephony } from "./twilio";

export { gmail, googleCalendar, outlookCalendar, slack, telephony };
export type { CalendarEventInput } from "./outbound";

/** Routes each external write to the right provider. Calendar prefers Google, then Outlook, else stays local-only. */
export const outbound: Outbound = {
  async createCalendarEvent(userId, e) {
    if (await isConnected(userId, "google")) return googleCalendar.create(userId, e);
    return outlookCalendar.create(userId, e); // returns null when Outlook isn't connected either
  },
  updateCalendarEvent: async (userId, source, id, e) => void (await (source === "google" ? googleCalendar.update(userId, id, e) : outlookCalendar.update(userId, id, e))),
  deleteCalendarEvent: async (userId, source, id) => void (await (source === "google" ? googleCalendar.remove(userId, id) : outlookCalendar.remove(userId, id))),
  sendEmail: gmail.send, sendSlack: slack.send,
  sendSms: (_u, to, body) => telephony.sms(to, body), placeCall: (_u, to, say) => telephony.call(to, say),
};
