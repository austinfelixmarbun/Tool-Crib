import type { NextFunction, Request, Response } from "express";
import * as orgService from "../services/organization.service.ts";
import { sendCreated, sendSuccess } from "../utils/api-response.ts";

export async function getWorkCenters(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const list = await orgService.listWorkCenters();
    return sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
}

export async function getWorkCenter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const item = await orgService.getWorkCenterById(Number(req.params.id));
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
}

export async function createWorkCenter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const item = await orgService.createWorkCenter(req.body);
    return sendCreated(res, item, "Work center created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateWorkCenter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const item = await orgService.updateWorkCenter(
      Number(req.params.id),
      req.body
    );
    return sendSuccess(res, item, "Work center updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkCenter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await orgService.deleteWorkCenter(Number(req.params.id));
    return sendSuccess(res, null, "Work center deleted successfully");
  } catch (error) {
    next(error);
  }
}

export async function getWorkAreas(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const list = await orgService.listWorkAreas();
    return sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
}

export async function getWorkArea(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const item = await orgService.getWorkAreaById(Number(req.params.id));
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
}

export async function createWorkArea(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const item = await orgService.createWorkArea(req.body);
    return sendCreated(res, item, "Work area created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateWorkArea(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const item = await orgService.updateWorkArea(
      Number(req.params.id),
      req.body
    );
    return sendSuccess(res, item, "Work area updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkArea(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await orgService.deleteWorkArea(Number(req.params.id));
    return sendSuccess(res, null, "Work area deleted successfully");
  } catch (error) {
    next(error);
  }
}
