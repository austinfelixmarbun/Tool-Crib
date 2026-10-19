// src/routes/dashboard.routes.ts
import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";

const router = Router();

router.use(authMiddleware);

router.get("/", dashboardController.getStats);
router.get("/stats", dashboardController.getStats);
router.get("/transactions", dashboardController.getTransactions);
router.get("/movement", dashboardController.getMovement);
router.get("/maintenance-alerts", dashboardController.getMaintenanceAlerts);
router.get("/audit-logs", dashboardController.getAuditLogs);

export default router;
