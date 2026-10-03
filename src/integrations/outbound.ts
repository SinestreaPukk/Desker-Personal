/** The contract every external write goes through. Implementation: ./index.ts. */
export type CalendarEventInput = { title: string; startsAt: Date; endsAt: Date };

export interface Outbound {
  createCalendarEvent(userId: string, e: CalendarEventInput): Promise<{ externalId: string; source: string } | null>;
  updateCalendarEvent(userId: string, source: string, externalId: string, e: Partial<CalendarEventInput>): Promise<void>;
  deleteCalendarEvent(userId: string, source: string, externalId: string): Promise<void>;
  sendEmail(userId: string, to: string, subject: string, body: string): Promise<void>;
  sendSlack(userId: string, channel: string, text: string): Promise<void>;
  sendSms(userId: string, to: string, body: string): Promise<void>;
  placeCall(userId: string, to: string, say: string): Promise<void>;
}
