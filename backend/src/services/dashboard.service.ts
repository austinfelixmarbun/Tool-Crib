import { count, eq } from "drizzle-orm";
import { db } from "../config/database.ts";
import {
  tool as toolTable,
  toolUnit as toolUnitTable,
  transaction as transactionTable,
} from "../db/schema/index.ts";
import * as txRepo from "../repositories/transaction.repository.ts";

export async function getDashboardStats() {
  const [totalToolTypesRes] = await db
    .select({ count: count() })
    .from(toolTable);

  const [totalUnitsRes] = await db
    .select({ count: count() })
    .from(toolUnitTable);

  const [readyUnitsRes] = await db
    .select({ count: count() })
    .from(toolUnitTable)
    .where(eq(toolUnitTable.status, "READY"));

  const [borrowedUnitsRes] = await db
    .select({ count: count() })
    .from(toolUnitTable)
    .where(eq(toolUnitTable.status, "BORROWED"));

  const [maintenanceUnitsRes] = await db
    .select({ count: count() })
    .from(toolUnitTable)
    .where(eq(toolUnitTable.status, "MAINTANANCE"));

  const [pendingTxRes] = await db
    .select({ count: count() })
    .from(transactionTable)
    .where(eq(transactionTable.status, "PENDING"));

  const [approvedTxRes] = await db
    .select({ count: count() })
    .from(transactionTable)
    .where(eq(transactionTable.status, "APPROVED"));

  const allTx = await txRepo.listTransactions();
  const todayStr = new Date().toISOString().split("T")[0];

  let dueTodayCount = 0;
  let overdueCount = 0;
  for (const t of allTx) {
    if (t.status === "APPROVED" && t.expectedReturnDate) {
      const expDate = t.expectedReturnDate.split("T")[0];
      if (expDate === todayStr) {
        dueTodayCount++;
      } else if (expDate < todayStr) {
        overdueCount++;
      }
    }
  }

  const borrowed = Number(borrowedUnitsRes?.count ?? 0);
  const pendingRequests = Number(pendingTxRes?.count ?? 0);

  return {
    borrowed,
    dueToday: dueTodayCount,
    overdue: overdueCount,
    pendingRequests,
    tools: {
      totalTypes: Number(totalToolTypesRes?.count ?? 0),
      totalUnits: Number(totalUnitsRes?.count ?? 0),
      ready: Number(readyUnitsRes?.count ?? 0),
      borrowed,
      maintenance: Number(maintenanceUnitsRes?.count ?? 0),
    },
    transactions: {
      pending: pendingRequests,
      activeLoans: Number(approvedTxRes?.count ?? 0),
    },
  };
}

export async function getDashboardTransactions() {
  const list = await txRepo.listTransactions();
  return list.map((t) => ({
    id: t.id.toString(),
    status: t.status === "APPROVED" ? "Borrowed" : t.status === "RETURNED" ? "Returned" : t.status,
    checkoutDate: t.checkoutDate || t.createdAt,
    dueDate: t.expectedReturnDate || t.checkoutDate || t.createdAt,
    returnDate: null,
    jidNo: t.jidNo,
    referenceType: t.referenceType,
    workCenter: t.workCenter,
    workArea: t.workArea,
    user: t.user,
    borrower: t.user,
    inventoryItem: t.items?.[0]?.toolType ? {
      toolNumber: t.items[0].toolType.toolNumber,
      toolName: t.items[0].toolType.name,
    } : null,
    items: t.items,
    details: t.details,
  }));
}

export async function getDashboardMovement() {
  const tools = await db.select().from(toolTable);
  return {
    fastMoving: tools.slice(0, 5).map((t) => ({
      partNumber: t.toolNumber,
      toolName: t.name,
      turnover: 12,
    })),
    slowMoving: tools.slice(5, 10).map((t) => ({
      partNumber: t.toolNumber,
      toolName: t.name,
      turnover: 1,
    })),
  };
}

export async function getMaintenanceAlerts() {
  return [];
}

export async function getAuditLogs() {
  return [];
}
