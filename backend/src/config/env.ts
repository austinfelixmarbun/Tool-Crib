import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z, ZodError } from "zod";

expand(config());

const stringBoolean = z.coerce
  .string()
  .transform((val) => val === "true")
  .default(false);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  SESSION_SECRET: z.string().min(1,"SESSION_SECRET is required"),
  SUPER_ADMIN_PASS: z
    .string()
    .startsWith("$argon2", "SUPER_ADMIN_PASS must be a valid argon2 hash string"),
  DB_HOST: z.string().default("localhost"),
  DB_USER: z.string().default("user"),
  DB_PASSWORD: z.string().default("password"),
  DB_NAME: z.string().default("toolcrib"),
  DB_PORT: z.coerce.number().default(5432),
  DATABASE_URL: z.string().min(1,"DATABASE_URL is required"),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000")
    .transform((val) => val.split(",").map((s) => s.trim())),
  DB_MIGRATING: stringBoolean,
  DB_SEEDING: stringBoolean,
});

export type EnvSchema = z.infer<typeof EnvSchema>;

let env: EnvSchema;

try {
  env = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing or invalid values in .env:\n";
    error.issues.forEach((issue) => {
      message += `  - ${String(issue.path[0])}: ${issue.message}\n`;
    });
    const e = new Error(message);
    e.stack = "";
    throw e;
  } else {
    console.error(error);
    throw error;
  }
}

export default env;
