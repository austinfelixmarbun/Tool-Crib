import { z } from "zod";

export const BorrowRequestDto = z.object({
  programId: z.number().int().positive(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        toolTypeId: z.number().int().positive(),
        requestedQty: z.number().int().min(1),
      })
    )
    .min(1, "At least one tool type must be selected"),
});

export const BorrowApproveDto = z.object({
  referenceType: z.string().max(30),
  jidNo: z.string().max(30),
  workCenterId: z.number().int().positive(),
  workAreaId: z.number().int().positive(),
  checkoutDate: z.string().datetime(),
  expectedReturnDate: z.string().datetime(),
  itemAssignments: z.array(
    z.object({
      transactionItemId: z.string(),
      toolUnitIds: z.array(z.number().int().positive()).min(1),
    })
  ),
});

export const ReturnItemDto = z.object({
  toolUnitId: z.number().int().positive(),
  status: z.enum(["RETURNED", "BROKEN", "LOST"]),
  returnNotes: z.string().max(500).optional(),
});

export const ReturnDto = z.object({
  details: z.array(ReturnItemDto).min(1),
});

export type BorrowRequestDto = z.infer<typeof BorrowRequestDto>;
export type BorrowApproveDto = z.infer<typeof BorrowApproveDto>;
export type ReturnDto = z.infer<typeof ReturnDto>;
export type ReturnItemDto = z.infer<typeof ReturnItemDto>;
