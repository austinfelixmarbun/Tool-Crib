// src/routes/work-center.routes.ts
import { Router } from "express";
import * as orgController from "../controllers/organization.controller.ts";
import {
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
} from "../dtos/organization.dto.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { requireSuperAdmin } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const router = Router();

router.use(authMiddleware);

router.get("/", orgController.getWorkCenters);
router.get("/:id", orgController.getWorkCenter);
router.post(
  "/",
  requireSuperAdmin,
  validate(CreateWorkCenterDto),
  orgController.createWorkCenter
);
router.patch(
  "/:id",
  requireSuperAdmin,
  validate(UpdateWorkCenterDto),
  orgController.updateWorkCenter
);
router.delete("/:id", requireSuperAdmin, orgController.deleteWorkCenter);

export default router;
