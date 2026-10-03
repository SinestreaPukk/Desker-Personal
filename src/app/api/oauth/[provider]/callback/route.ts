import { cookies } from "next/headers";
import { providers, type ProviderName } from "../../oauth";
import { asResponse, requireUser } from "@/app/session";

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  try {
    const userId = await requireUser();
    const p = providers[(await params).provider as ProviderName];
    const q = new URL(req.url).searchParams;
    if (!p || !q.get("code") || q.get("state") !== (await cookies()).get("oauth_state")?.value) return new Response("invalid oauth state", { status: 400 });
    await p.finish(userId, q.get("code")!);
    return Response.redirect(`${process.env.APP_URL}/?connected=${(await params).provider}`, 302);
  } catch (e) { return asResponse(e); }
}
