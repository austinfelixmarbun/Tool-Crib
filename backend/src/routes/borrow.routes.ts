import { Router } from "express";
import * as borrowController from "../controllers/borrow.controller.ts";
import { BorrowApproveDto, BorrowRequestDto } from "../dtos/transaction.dto.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { requireAdmin } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const router = Router();

router.use(authMiddleware);

// User borrow request flow (supports both / and /requests)
router.post("/", validate(BorrowRequestDto), borrowController.createBorrowRequest);
router.post("/requests", validate(BorrowRequestDto), borrowController.createBorrowRequest);

router.get("/", borrowController.listBorrowRequests);
router.get("/requests", borrowController.listBorrowRequests);

router.get("/:id", borrowController.getBorrowRequest);
router.get("/requests/:id", borrowController.getBorrowRequest);

// Admin counter approval flow
router.post(
  "/:id/approve",
  requireAdmin,
  validate(BorrowApproveDto),
  borrowController.approveBorrowRequest
);
router.post(
  "/requests/:id/verify",
  requireAdmin,
  validate(BorrowApproveDto),
  borrowController.approveBorrowRequest
);

export default router;
