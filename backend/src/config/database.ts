import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import env from "./env.ts";
import * as schema from "../db/schema/index.ts";

export const connection = postgres(env.DATABASE_URL, {
  max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,
  onnotice: env.DB_SEEDING ? () => {} : undefined,
});

export const db = drizzle(connection, {
  schema,
  logger: env.NODE_ENV === "development",
});

export type DbType = typeof db;
export default db;
