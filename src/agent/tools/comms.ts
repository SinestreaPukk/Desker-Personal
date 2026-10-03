import { z } from "zod";
import { outbound } from "@/integrations";
import { defineTool } from "../tool";

export const sendEmail = defineTool({
  name: "send_email", kind: "consequential",
  description: "Send an email from the user's Gmail.",
  schema: z.object({ to: z.string().email(), subject: z.string(), body: z.string() }),
  summarize: (i) => `Email ${i.to}: "${i.subject}"`,
  async execute({ userId }, i) { await outbound.sendEmail(userId, i.to, i.subject, i.body); return { text: "Email sent" }; },
});

export const sendSlack = defineTool({
  name: "send_slack", kind: "consequential",
  description: "Post a Slack message to a channel or person.",
  schema: z.object({ channel: z.string(), text: z.string() }),
  summarize: (i) => `Slack ${i.channel}: "${i.text.slice(0, 60)}"`,
  async execute({ userId }, i) { await outbound.sendSlack(userId, i.channel, i.text); return { text: "Slack message sent" }; },
});

export const sendSms = defineTool({
  name: "send_sms", kind: "consequential",
  description: "Send an SMS.",
  schema: z.object({ to: z.string(), body: z.string() }),
  summarize: (i) => `Text ${i.to}: "${i.body.slice(0, 60)}"`,
  async execute({ userId }, i) { await outbound.sendSms(userId, i.to, i.body); return { text: "SMS sent" }; },
});

export const placeCall = defineTool({
  name: "place_call", kind: "consequential",
  description: "Place a phone call that speaks a message.",
  schema: z.object({ to: z.string(), say: z.string() }),
  summarize: (i) => `Call ${i.to}`,
  async execute({ userId }, i) { await outbound.placeCall(userId, i.to, i.say); return { text: "Call placed" }; },
});
