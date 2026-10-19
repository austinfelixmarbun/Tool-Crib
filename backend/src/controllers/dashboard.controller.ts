import type { NextFunction, Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service.ts";
import { sendSuccess } from "../utils/api-response.ts";

export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await dashboardService.getDashboardStats();
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

export async function getTransactions(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const transactions = await dashboardService.getDashboardTransactions();
    return sendSuccess(res, { transactions });
  } catch (error) {
    next(error);
  }
}

export async function getMovement(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const movement = await dashboardService.getDashboardMovement();
    return sendSuccess(res, movement);
  } catch (error) {
    next(error);
  }
}

export async function getMaintenanceAlerts(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const alerts = await dashboardService.getMaintenanceAlerts();
    return sendSuccess(res, { alerts });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const auditLogs = await dashboardService.getAuditLogs();
    return sendSuccess(res, { auditLogs });
  } catch (error) {
    next(error);
  }
}
