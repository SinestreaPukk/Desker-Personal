import twilio from "twilio";

/** Call screening, step 1: answer, ask the caller who they are and why. */
export async function POST() {
  const r = new twilio.twiml.VoiceResponse();
  r.say("Hi, you've reached Desker, an assistant. Please say your name and why you're calling.");
  r.gather({ input: ["speech"], action: "/api/twilio/screen", timeout: 5, speechTimeout: "auto" });
  r.say("I didn't catch that. Goodbye.");
  return new Response(r.toString(), { headers: { "content-type": "text/xml" } });
}
