import { Router } from "express";
import { ROUTES } from "../constants/routes.ts";
import authRoutes from "./auth.routes.ts";
import borrowRoutes from "./borrow.routes.ts";
import dashboardRoutes from "./dashboard.routes.ts";
import inventoryRoutes from "./inventory.routes.ts";
import programRoutes from "./program.routes.ts";
import returnRoutes from "./return.routes.ts";
import userRoutes from "./user.routes.ts";
import workAreaRoutes from "./work-area.routes.ts";
import workCenterRoutes from "./work-center.routes.ts";

const router = Router();

router.get(ROUTES.HEALTH, (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

router.use(ROUTES.AUTH, authRoutes);
router.use(ROUTES.USERS, userRoutes);
router.use(ROUTES.BORROW, borrowRoutes);
router.use(ROUTES.BORROWS, borrowRoutes);
router.use(ROUTES.RETURN, returnRoutes);
router.use(ROUTES.RETURNS, returnRoutes);
router.use(ROUTES.INVENTORY, inventoryRoutes);
router.use(ROUTES.PROGRAMS, programRoutes);
router.use(ROUTES.WORK_CENTERS, workCenterRoutes);
router.use(ROUTES.WORK_AREAS, workAreaRoutes);
router.use(ROUTES.DASHBOARD, dashboardRoutes);

export default router;
