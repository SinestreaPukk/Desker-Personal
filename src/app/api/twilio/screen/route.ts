import twilio from "twilio";
import { sql } from "drizzle-orm";
import { requestApproval } from "@/agent/approvals";
import { notify } from "@/channels/notify";
import { db } from "@/db/client";
import { users } from "@/db/schema";

/** Call screening, step 2: relay what the caller said to the owner (app + LINE) with a Yes/No to text them back. */
export async function POST(req: Request) {
  const form = new URLSearchParams(await req.text());
  if (!twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN!, req.headers.get("x-twilio-signature") ?? "", `${process.env.APP_URL}/api/twilio/screen`, Object.fromEntries(form)))
    return new Response("bad signature", { status: 403 });

  const from = form.get("From") ?? "unknown", said = form.get("SpeechResult") ?? "(nothing)";
  const [owner] = await db.select().from(users).where(sql`${users.preferences}->>'twilioNumber' = ${form.get("To")}`);
  if (owner) {
    const card = await requestApproval(db, owner.id, "send_sms", { to: from, body: "Hi, this is Desker, assistant to " + owner.name + ". They got your message and will get back to you soon." }, `Text ${from} that you got their message`);
    await notify(db, owner.id, [{ type: "text", text: `Missed call from ${from}. They said: "${said}"` }, card]);
  }
  const r = new twilio.twiml.VoiceResponse();
  r.say("Thanks. I've passed that on. Goodbye.");
  return new Response(r.toString(), { headers: { "content-type": "text/xml" } });
}
