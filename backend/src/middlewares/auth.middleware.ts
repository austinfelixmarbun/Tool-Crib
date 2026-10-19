// src/middlewares/auth.middleware.ts
// Reads the signed session cookie and attaches user to req.user

import argon2 from "argon2";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import { db } from "../config/database.ts";
import { user as userTable } from "../db/schema/index.ts";
import type { UserSession } from "../types/express.d.ts";
import { unauthorized } from "../utils/app-error.ts";
import logger from "../utils/logger.ts";

// We store session data as a base64-encoded JSON payload in an HttpOnly cookie.
// Signature is HMAC-SHA256 over the payload using SESSION_SECRET.

import { createHmac, timingSafeEqual } from "node:crypto";
import env from "../config/env.ts";

function sign(payload: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url");
}

export function createSessionCookie(session: UserSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function verifySessionCookie(cookie: string): UserSession | null {
  const dotIdx = cookie.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const payload = cookie.slice(0, dotIdx);
  const sig = cookie.slice(dotIdx + 1);
  const expected = sign(payload);

  try {
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as UserSession;
  } catch {
    return null;
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cookie = req.cookies?.session as string | undefined;

    if (!cookie) {
      return next(unauthorized());
    }

    const session = verifySessionCookie(cookie);
    if (!session) {
      return next(unauthorized("Invalid session"));
    }

    // Verify user still exists & is active
    const [dbUser] = await db
      .select({
        id: userTable.id,
        status: userTable.status,
        role: userTable.role,
      })
      .from(userTable)
      .where(eq(userTable.id, session.id))
      .limit(1);

    if (!dbUser || dbUser.status !== "ACTIVE") {
      res.clearCookie("session");
      return next(unauthorized("Session revoked"));
    }

    req.user = session;
    next();
  } catch (err) {
    logger.error("authMiddleware error", err);
    next(err);
  }
}

export { argon2, verifySessionCookie };
