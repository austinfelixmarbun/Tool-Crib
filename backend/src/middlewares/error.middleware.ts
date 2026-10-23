import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.ts";
import logger from "../utils/logger.ts";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`AppError [${err.statusCode}]: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  logger.error("Unhandled error", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
