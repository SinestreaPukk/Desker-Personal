import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { connections } from "@/db/schema";
import { decrypt, encrypt } from "./crypto";

type Provider = "google" | "outlook" | "slack" | "twilio";
export type Tokens = Record<string, unknown>;

export async function getTokens(userId: string, provider: Provider): Promise<Tokens | null> {
  const [c] = await db.select().from(connections).where(and(eq(connections.userId, userId), eq(connections.provider, provider)));
  return c ? JSON.parse(decrypt(c.encryptedTokens)) : null;
}

export async function saveTokens(userId: string, provider: Provider, tokens: Tokens) {
  const encryptedTokens = encrypt(JSON.stringify(tokens));
  await db.insert(connections).values({ userId, provider, encryptedTokens })
    .onConflictDoUpdate({ target: [connections.userId, connections.provider], set: { encryptedTokens } });
}

export async function isConnected(userId: string, provider: Provider) {
  return (await getTokens(userId, provider)) !== null;
}
