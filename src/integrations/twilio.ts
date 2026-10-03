import twilio from "twilio";

const c = () => twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const from = () => process.env.TWILIO_FROM!;
const esc = (s: string) => s.replace(/[<>&]/g, "");

export const telephony = {
  async sms(to: string, body: string) { await c().messages.create({ to, from: from(), body }); },
  async call(to: string, say: string) { await c().calls.create({ to, from: from(), twiml: `<Response><Say>${esc(say)}</Say></Response>` }); },
};
