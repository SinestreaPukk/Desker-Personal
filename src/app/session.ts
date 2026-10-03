import { cookies } from "next/headers";

// ponytail: bare cookie = identity, no real auth. Replace with LINE Login/OAuth before multi-user or public deploy.
export async function getUserId(): Promise<string | null> {
  return (await cookies()).get("desker_uid")?.value ?? null;
}
export async function requireUser(): Promise<string> {
  const id = await getUserId();
  if (!id) throw new Response("not signed in", { status: 401 });
  return id;
}
export const asResponse = (e: unknown) => (e instanceof Response ? e : new Response(String(e), { status: 500 }));
