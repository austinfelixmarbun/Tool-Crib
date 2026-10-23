import { Router } from "express";
import * as programController from "../controllers/program.controller.ts";
import { CreateProgramDto, UpdateProgramDto } from "../dtos/program.dto.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { requireSuperAdmin } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const router = Router();

router.use(authMiddleware);

router.get("/", programController.getPrograms);
router.get("/:id", programController.getProgram);
router.post(
  "/",
  requireSuperAdmin,
  validate(CreateProgramDto),
  programController.createProgram
);
router.patch(
  "/:id",
  requireSuperAdmin,
  validate(UpdateProgramDto),
  programController.updateProgram
);
router.delete("/:id", requireSuperAdmin, programController.deleteProgram);

export default router;
