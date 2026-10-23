import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { sendError } from "../utils/api-response.ts";

type ValidateTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors;
      sendError(res, "Validation failed", 400, errors);
      return;
    }
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}
