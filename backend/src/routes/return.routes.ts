import { Router } from "express";
import * as returnController from "../controllers/return.controller.ts";
import { ReturnDto } from "../dtos/transaction.dto.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { requireAdmin } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const router = Router();

router.use(authMiddleware);

router.get("/", returnController.listLoans);
router.get("/active/:nik", returnController.getActiveBorrowsByNik);
router.get("/:id", returnController.getLoan);

router.post(
  "/:id",
  requireAdmin,
  validate(ReturnDto),
  returnController.processReturn
);

export default router;
