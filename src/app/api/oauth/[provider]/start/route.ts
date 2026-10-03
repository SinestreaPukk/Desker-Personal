import { randomUUID } from "node:crypto";
import { providers, type ProviderName } from "../../oauth";
import { asResponse, requireUser } from "@/app/session";

export async function GET(_: Request, { params }: { params: Promise<{ provider: string }> }) {
  try {
    await requireUser();
    const p = providers[(await params).provider as ProviderName];
    if (!p) return new Response("unknown provider", { status: 404 });
    const state = randomUUID();
    const res = Response.redirect(p.url(state), 302);
    res.headers.append("set-cookie", `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
    return res;
  } catch (e) { return asResponse(e); }
}
