import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const sql = postgres(process.env.DATABASE_URL!, { max: 3, prepare: false }) // prepare:false works with pooled (pgbouncer) URLs;
export const db = drizzle(sql, { schema });
export type Db = typeof db;
