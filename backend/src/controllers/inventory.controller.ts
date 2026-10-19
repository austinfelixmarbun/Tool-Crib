import type { NextFunction, Request, Response } from "express";
import * as inventoryService from "../services/inventory.service.ts";
import { sendCreated, sendSuccess } from "../utils/api-response.ts";

export async function getToolTypes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const programId = req.query.programId
      ? Number(req.query.programId)
      : undefined;
    const tools = await inventoryService.listToolTypes(programId);
    return sendSuccess(res, tools);
  } catch (error) {
    next(error);
  }
}

export async function getToolType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tool = await inventoryService.getToolTypeById(Number(req.params.id));
    return sendSuccess(res, tool);
  } catch (error) {
    next(error);
  }
}

export async function createToolType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tool = await inventoryService.createToolType(req.body);
    return sendCreated(res, tool, "Tool type created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateToolType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tool = await inventoryService.updateToolType(
      Number(req.params.id),
      req.body
    );
    return sendSuccess(res, tool, "Tool type updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteToolType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await inventoryService.deleteToolType(Number(req.params.id));
    return sendSuccess(res, null, "Tool type deleted successfully");
  } catch (error) {
    next(error);
  }
}

export async function getToolUnits(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const units = await inventoryService.listUnitsByToolType(
      Number(req.params.toolTypeId)
    );
    return sendSuccess(res, units);
  } catch (error) {
    next(error);
  }
}

export async function createToolUnit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const unit = await inventoryService.createToolUnit(req.body);
    return sendCreated(res, unit, "Tool unit created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateToolUnitStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const unit = await inventoryService.updateToolUnitStatus(
      Number(req.params.id),
      req.body
    );
    return sendSuccess(res, unit, "Tool unit status updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteToolUnit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await inventoryService.deleteToolUnit(Number(req.params.id));
    return sendSuccess(res, null, "Tool unit deleted successfully");
  } catch (error) {
    next(error);
  }
}

export async function getCalibrationOverview(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const overview = await inventoryService.getCalibrationOverview();
    return sendSuccess(res, overview);
  } catch (error) {
    next(error);
  }
}
