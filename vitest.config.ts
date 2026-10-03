import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { env: { DATABASE_URL: process.env.DATABASE_URL ?? "postgres://desker:desker@localhost:5432/desker" } },
});
