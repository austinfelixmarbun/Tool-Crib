// src/routes/user.routes.ts
import { Router } from "express";
import * as userController from "../controllers/user.controller.ts";
import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from "../dtos/user.dto.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { requireAdmin, requireSuperAdmin } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const router = Router();

router.use(authMiddleware);

// Admin can lookup user by NIK for borrow verification
router.get("/by-nik/:nik", requireAdmin, userController.getUserByNik);

// Only Super Admin can access full user management
router.get("/", requireSuperAdmin, userController.getUsers);
router.get("/:id", requireSuperAdmin, userController.getUser);
router.post("/", requireSuperAdmin, validate(CreateUserDto), userController.createUser);
router.patch("/:id", requireSuperAdmin, validate(UpdateUserDto), userController.updateUser);
router.post(
  "/:id/reset-password",
  requireSuperAdmin,
  validate(ResetPasswordDto),
  userController.resetPassword
);
router.delete("/:id", requireSuperAdmin, userController.deleteUser);

export default router;
