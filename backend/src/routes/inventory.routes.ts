import { Router } from "express";
import * as inventoryController from "../controllers/inventory.controller.ts";
import {
  CreateToolTypeDto,
  CreateToolUnitDto,
  UpdateToolTypeDto,
  UpdateToolUnitDto,
} from "../dtos/tool.dto.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { requireAdmin } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const router = Router();

router.use(authMiddleware);

router.get("/calibration", inventoryController.getCalibrationOverview);

router.get("/", inventoryController.getToolTypes);
router.get("/tools", inventoryController.getToolTypes);

router.get("/:id(\\d+)", inventoryController.getToolType);
router.get("/tools/:id(\\d+)", inventoryController.getToolType);

router.post(
  "/",
  requireAdmin,
  validate(CreateToolTypeDto),
  inventoryController.createToolType,
);
router.post(
  "/tools",
  requireAdmin,
  validate(CreateToolTypeDto),
  inventoryController.createToolType,
);

router.patch(
  "/:id(\\d+)",
  requireAdmin,
  validate(UpdateToolTypeDto),
  inventoryController.updateToolType,
);
router.patch(
  "/tools/:id(\\d+)",
  requireAdmin,
  validate(UpdateToolTypeDto),
  inventoryController.updateToolType,
);

router.delete("/:id(\\d+)", requireAdmin, inventoryController.deleteToolType);
router.delete(
  "/tools/:id(\\d+)",
  requireAdmin,
  inventoryController.deleteToolType,
);

router.get("/tools/:toolTypeId/units", inventoryController.getToolUnits);
router.post(
  "/units",
  requireAdmin,
  validate(CreateToolUnitDto),
  inventoryController.createToolUnit,
);
router.patch(
  "/units/:id/status",
  requireAdmin,
  validate(UpdateToolUnitDto),
  inventoryController.updateToolUnitStatus,
);
router.delete("/units/:id", requireAdmin, inventoryController.deleteToolUnit);

export default router;
