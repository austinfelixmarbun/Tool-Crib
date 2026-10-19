import type { NextFunction, Request, Response } from "express";
import * as borrowService from "../services/borrow.service.ts";
import { sendCreated, sendSuccess } from "../utils/api-response.ts";
import { unauthorized } from "../utils/app-error.ts";

export async function createBorrowRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw unauthorized();
    const created = await borrowService.createBorrowRequest(
      req.user.id,
      req.body
    );
    return sendCreated(res, created, "Borrow request submitted successfully");
  } catch (error) {
    next(error);
  }
}

export async function listBorrowRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw unauthorized();
    const list = await borrowService.listBorrowRequests({
      userId: req.user.id,
      role: req.user.role,
    });
    return sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
}

export async function getBorrowRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const item = await borrowService.getBorrowRequestById(req.params.id);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
}

export async function approveBorrowRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw unauthorized();
    const approved = await borrowService.approveBorrowRequest(
      req.user.id,
      req.params.id,
      req.body
    );
    return sendSuccess(res, approved, "Borrow request approved successfully");
  } catch (error) {
    next(error);
  }
}
