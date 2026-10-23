import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";
import { LoginDto } from "../dtos/auth.dto.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const router = Router();

router.post("/login", validate(LoginDto), authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getMe);

export default router;
