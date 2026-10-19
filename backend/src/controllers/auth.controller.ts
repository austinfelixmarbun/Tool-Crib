import type { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.service.ts";
import { sendSuccess } from "../utils/api-response.ts";
import { unauthorized } from "../utils/app-error.ts";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, sessionCookie } = await authService.loginService(req.body);

    res.cookie("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { user }, "Login successful");
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie("session");
    return sendSuccess(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw unauthorized();
    }
    const profile = await authService.getMeService(req.user.id);
    return sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}
