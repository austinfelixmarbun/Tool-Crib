import { desc, eq } from "drizzle-orm";
import { db } from "../config/database.ts";
import {
  toolUnit,
  transaction as transactionTable,
  transactionDetail,
  transactionItem,
} from "../db/schema/index.ts";
import { notFound } from "../utils/app-error.ts";

export async function findTransactionById(id: bigint) {
  const [row] = await db.query.transaction.findMany({
    where: eq(transactionTable.id, id),
    with: {
      user: true,
      approver: true,
      program: true,
      workCenter: true,
      workArea: true,
      items: {
        with: {
          toolType: true,
          details: {
            with: {
              toolUnit: true,
            },
          },
        },
      },
      details: {
        with: {
          toolUnit: {
            with: {
              tool: true,
            },
          },
        },
      },
    },
    limit: 1,
  });

  return row ?? null;
}

export async function listTransactions(userId?: string) {
  const query = db.query.transaction.findMany({
    where: userId ? eq(transactionTable.userId, userId) : undefined,
    orderBy: [desc(transactionTable.createdAt)],
    with: {
      user: true,
      approver: true,
      program: true,
      workCenter: true,
      workArea: true,
      items: {
        with: {
          toolType: true,
        },
      },
      details: {
        with: {
          toolUnit: {
            with: {
              tool: true,
            },
          },
        },
      },
    },
  });

  return query;
}

export async function createBorrowTransaction(data: {
  userId: string;
  programId: number;
  notes?: string;
  items: Array<{ toolTypeId: number; requestedQty: number }>;
}) {
  return await db.transaction(async (tx) => {
    const totalRequestedItems = data.items.reduce(
      (sum, item) => sum + item.requestedQty,
      0
    );

    const [createdTx] = await tx
      .insert(transactionTable)
      .values({
        userId: data.userId,
        programId: data.programId,
        type: "BORROW",
        status: "PENDING",
        notes: data.notes,
        totalRequestedItems,
        totalUnits: 0,
      })
      .returning();

    if (!createdTx) {
      throw new Error("Failed to create transaction record");
    }

    if (data.items.length > 0) {
      await tx.insert(transactionItem).values(
        data.items.map((item) => ({
          transactionId: createdTx.id,
          toolTypeId: item.toolTypeId,
          requestedQty: item.requestedQty,
        }))
      );
    }

    return createdTx;
  });
}

export async function approveBorrowTransaction(
  transactionId: bigint,
  data: {
    approverId: string;
    referenceType: string;
    jidNo: string;
    workCenterId: number;
    workAreaId: number;
    checkoutDate: string;
    expectedReturnDate: string;
    assignments: Array<{
      transactionItemId: bigint;
      toolUnitIds: number[];
    }>;
  }
) {
  return await db.transaction(async (tx) => {
    const totalUnits = data.assignments.reduce(
      (sum, item) => sum + item.toolUnitIds.length,
      0
    );

    const [updatedTx] = await tx
      .update(transactionTable)
      .set({
        approverId: data.approverId,
        referenceType: data.referenceType,
        jidNo: data.jidNo,
        workCenterId: data.workCenterId,
        workAreaId: data.workAreaId,
        checkoutDate: data.checkoutDate,
        expectedReturnDate: data.expectedReturnDate,
        status: "APPROVED",
        totalUnits,
      })
      .where(eq(transactionTable.id, transactionId))
      .returning();

    if (!updatedTx) {
      throw notFound("Transaction not found");
    }

    for (const assignment of data.assignments) {
      for (const unitId of assignment.toolUnitIds) {
        await tx.insert(transactionDetail).values({
          transactionId,
          transactionItemId: assignment.transactionItemId,
          toolUnitId: unitId,
          status: "BORROWED",
        });

        await tx
          .update(toolUnit)
          .set({ status: "BORROWED" })
          .where(eq(toolUnit.id, unitId));
      }
    }

    return updatedTx;
  });
}

export async function processUnitReturns(
  transactionId: bigint,
  returns: Array<{
    toolUnitId: number;
    status: "RETURNED" | "BROKEN" | "LOST";
    returnNotes?: string;
  }>
) {
  return await db.transaction(async (tx) => {
    const now = new Date().toISOString();

    for (const ret of returns) {
      await tx
        .update(transactionDetail)
        .set({
          status: ret.status,
          returnedAt: now,
          returnNotes: ret.returnNotes,
        })
        .where(
          eq(transactionDetail.toolUnitId, ret.toolUnitId)
        );

      const newUnitStatus =
        ret.status === "RETURNED"
          ? "READY"
          : ret.status === "BROKEN"
          ? "MAINTANANCE"
          : "SCRAPPED";

      await tx
        .update(toolUnit)
        .set({ status: newUnitStatus })
        .where(eq(toolUnit.id, ret.toolUnitId));
    }

    const activeDetails = await tx
      .select({ id: transactionDetail.id })
      .from(transactionDetail)
      .where(
        eq(transactionDetail.transactionId, transactionId)
      );

    const pendingDetails = await tx
      .select({ id: transactionDetail.id })
      .from(transactionDetail)
      .where(
        eq(transactionDetail.transactionId, transactionId)
      );

    const allUnits = await tx.query.transactionDetail.findMany({
      where: eq(transactionDetail.transactionId, transactionId),
    });

    const hasStillBorrowed = allUnits.some((u) => u.status === "BORROWED");
    if (!hasStillBorrowed && allUnits.length > 0) {
      await tx
        .update(transactionTable)
        .set({ status: "RETURNED" })
        .where(eq(transactionTable.id, transactionId));
    }

    return { success: true };
  });
}
