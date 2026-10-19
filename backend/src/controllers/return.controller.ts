import type { NextFunction, Request, Response } from "express";
import * as returnService from "../services/return.service.ts";
import { sendSuccess } from "../utils/api-response.ts";
import { unauthorized } from "../utils/app-error.ts";

export async function listLoans(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw unauthorized();
    const loans = await returnService.listActiveLoans({
      userId: req.user.id,
      role: req.user.role,
    });
    return sendSuccess(res, loans);
  } catch (error) {
    next(error);
  }
}

export async function getActiveBorrowsByNik(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const nik = Number(req.params.nik);
    const items = await returnService.listActiveLoansByNik(nik);
    return sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
}

export async function getLoan(req: Request, res: Response, next: NextFunction) {
  try {
    const loan = await returnService.getLoanDetails(req.params.id);
    return sendSuccess(res, loan);
  } catch (error) {
    next(error);
  }
}

export async function processReturn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await returnService.processReturn(req.params.id, req.body);
    return sendSuccess(res, result, "Return processed successfully");
  } catch (error) {
    next(error);
  }
}
