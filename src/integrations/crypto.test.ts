import { expect, test } from "vitest";
import { randomBytes } from "node:crypto";

test("encrypt/decrypt round-trips and is non-deterministic", async () => {
  process.env.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  const { encrypt, decrypt } = await import("./crypto");
  const a = encrypt("secret-token");
  expect(decrypt(a)).toBe("secret-token");
  expect(encrypt("secret-token")).not.toBe(a);
  expect(() => decrypt(a.slice(0, -4) + "AAAA")).toThrow();
});
