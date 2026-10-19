import postgres from "postgres";
import env from "../config/env.ts";
import * as schema from '../db/schema/index.ts'
import { drizzle } from "drizzle-orm/postgres-js";

export const connection = postgres(env.DATABASE_URL, {
  max: (env.DB_MIGRATING || env.DB_SEEDING) ? 1 : undefined,
  onnotice: env.DB_SEEDING ? () => {} : undefined
})

export const db = drizzle(connection, {
  schema, 
  logger: true
})

export type db = typeof db;

export default db;