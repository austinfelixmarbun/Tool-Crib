import type { NextFunction, Request, Response } from "express";
import * as programService from "../services/program.service.ts";
import { sendCreated, sendSuccess } from "../utils/api-response.ts";

export async function getPrograms(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const list = await programService.listPrograms();
    return sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
}

export async function getProgram(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const prog = await programService.getProgramById(Number(req.params.id));
    return sendSuccess(res, prog);
  } catch (error) {
    next(error);
  }
}

export async function createProgram(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const prog = await programService.createProgram(req.body);
    return sendCreated(res, prog, "Program created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateProgram(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const prog = await programService.updateProgram(
      Number(req.params.id),
      req.body
    );
    return sendSuccess(res, prog, "Program updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteProgram(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await programService.deleteProgram(Number(req.params.id));
    return sendSuccess(res, null, "Program deleted successfully");
  } catch (error) {
    next(error);
  }
}
