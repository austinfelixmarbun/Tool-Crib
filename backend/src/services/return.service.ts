import type { ReturnDto } from "../dtos/transaction.dto.ts";
import * as txRepo from "../repositories/transaction.repository.ts";
import * as userRepo from "../repositories/user.repository.ts";
import { badRequest, notFound } from "../utils/app-error.ts";

export async function listActiveLoans(filter?: {
  userId?: string;
  role?: string;
}) {
  const targetUserId = filter?.role === "USER" ? filter.userId : undefined;
  const transactions = await txRepo.listTransactions(targetUserId);

  return transactions.filter(
    (tx) => tx.status === "APPROVED" || tx.status === "PENDING"
  );
}

export async function listActiveLoansByNik(nik: number) {
  const user = await userRepo.findUserByEmployeeId(nik);
  if (!user) {
    throw notFound(`User with NIK ${nik} not found`);
  }

  const transactions = await txRepo.listTransactions(user.id);
  const activeTx = transactions.filter((tx) => tx.status === "APPROVED");

  const activeItems = [];
  for (const tx of activeTx) {
    for (const detail of tx.details) {
      if (detail.status === "BORROWED") {
        activeItems.push({
          transactionId: tx.id.toString(),
          detailId: detail.id.toString(),
          toolUnitId: detail.toolUnitId,
          seqNo: detail.toolUnit.seqNo,
          toolNumber: detail.toolUnit.tool.toolNumber,
          toolName: detail.toolUnit.tool.name,
          checkoutDate: tx.checkoutDate,
          expectedReturnDate: tx.expectedReturnDate,
          jidNo: tx.jidNo,
          referenceType: tx.referenceType,
        });
      }
    }
  }

  return activeItems;
}

export async function getLoanDetails(id: string) {
  const txId = BigInt(id);
  const tx = await txRepo.findTransactionById(txId);
  if (!tx) throw notFound("Loan record not found");
  return tx;
}

export async function processReturn(id: string, dto: ReturnDto) {
  const txId = BigInt(id);
  const tx = await txRepo.findTransactionById(txId);
  if (!tx) throw notFound("Transaction not found");

  if (tx.status !== "APPROVED") {
    throw badRequest(`Cannot process return for transaction in "${tx.status}" status`);
  }

  const detailUnitIds = new Set(tx.details.map((d) => d.toolUnitId));
  for (const item of dto.details) {
    if (!detailUnitIds.has(item.toolUnitId)) {
      throw badRequest(
        `Tool unit ID ${item.toolUnitId} is not part of transaction ${id}`
      );
    }
  }

  await txRepo.processUnitReturns(txId, dto.details);

  return { message: "Return processed successfully" };
}
