import { Router } from "express";
import * as orgController from "../controllers/organization.controller.ts";
import {
  CreateWorkAreaDto,
  UpdateWorkAreaDto,
} from "../dtos/organization.dto.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { requireSuperAdmin } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const router = Router();

router.use(authMiddleware);

router.get("/", orgController.getWorkAreas);
router.get("/:id", orgController.getWorkArea);
router.post(
  "/",
  requireSuperAdmin,
  validate(CreateWorkAreaDto),
  orgController.createWorkArea
);
router.patch(
  "/:id",
  requireSuperAdmin,
  validate(UpdateWorkAreaDto),
  orgController.updateWorkArea
);
router.delete("/:id", requireSuperAdmin, orgController.deleteWorkArea);

export default router;
