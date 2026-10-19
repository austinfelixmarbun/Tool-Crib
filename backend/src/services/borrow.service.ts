// src/services/borrow.service.ts
import type { BorrowApproveDto, BorrowRequestDto } from "../dtos/transaction.dto.ts";
import * as toolTypeRepo from "../repositories/tool-type.repository.ts";
import * as toolUnitRepo from "../repositories/tool-unit.repository.ts";
import * as txRepo from "../repositories/transaction.repository.ts";
import { badRequest, notFound } from "../utils/app-error.ts";

export async function createBorrowRequest(userId: string, dto: BorrowRequestDto) {
  // Validate that all requested tool types exist
  for (const item of dto.items) {
    const toolType = await toolTypeRepo.findToolTypeById(item.toolTypeId);
    if (!toolType) {
      throw notFound(`Tool type with ID ${item.toolTypeId} does not exist`);
    }
  }

  const created = await txRepo.createBorrowTransaction({
    userId,
    programId: dto.programId,
    notes: dto.notes,
    items: dto.items,
  });

  return created;
}

export async function listBorrowRequests(filter?: {
  userId?: string;
  role?: string;
}) {
  // If role is USER, only return their own transactions
  const targetUserId =
    filter?.role === "USER" ? filter.userId : undefined;

  return await txRepo.listTransactions(targetUserId);
}

export async function getBorrowRequestById(id: string) {
  const txId = BigInt(id);
  const tx = await txRepo.findTransactionById(txId);
  if (!tx) throw notFound("Transaction not found");
  return tx;
}

export async function approveBorrowRequest(
  adminId: string,
  id: string,
  dto: BorrowApproveDto
) {
  const txId = BigInt(id);
  const tx = await txRepo.findTransactionById(txId);
  if (!tx) throw notFound("Transaction not found");

  if (tx.status !== "PENDING") {
    throw badRequest(`Cannot approve transaction with status "${tx.status}"`);
  }

  // Validate unit availability and matching
  for (const assignment of dto.itemAssignments) {
    const item = tx.items.find((i) => i.id.toString() === assignment.transactionItemId);
    if (!item) {
      throw badRequest(`Transaction item ${assignment.transactionItemId} not found in this request`);
    }

    if (assignment.toolUnitIds.length !== item.requestedQty) {
      throw badRequest(
        `Quantity mismatch for item ${assignment.transactionItemId}: requested ${item.requestedQty}, provided ${assignment.toolUnitIds.length}`
      );
    }

    for (const unitId of assignment.toolUnitIds) {
      const unit = await toolUnitRepo.findUnitById(unitId);
      if (!unit) {
        throw notFound(`Tool unit ID ${unitId} does not exist`);
      }
      if (unit.toolId !== item.toolTypeId) {
        throw badRequest(
          `Unit ${unitId} does not belong to requested tool type ${item.toolTypeId}`
        );
      }
      if (unit.status !== "READY") {
        throw badRequest(
          `Unit ${unitId} is not available (current status: ${unit.status})`
        );
      }
    }
  }

  const approved = await txRepo.approveBorrowTransaction(txId, {
    approverId: adminId,
    referenceType: dto.referenceType,
    jidNo: dto.jidNo,
    workCenterId: dto.workCenterId,
    workAreaId: dto.workAreaId,
    checkoutDate: dto.checkoutDate,
    expectedReturnDate: dto.expectedReturnDate,
    assignments: dto.itemAssignments.map((a) => ({
      transactionItemId: BigInt(a.transactionItemId),
      toolUnitIds: a.toolUnitIds,
    })),
  });

  return approved;
}
