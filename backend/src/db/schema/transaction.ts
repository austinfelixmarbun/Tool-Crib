import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import program from "./program.ts";
import transactionDetail from "./transaction_detail.ts";
import transactionItem from "./transaction_item.ts";
import user from "./user.ts";
import workArea from "./work_area.ts";
import workCenter from "./work_center.ts";

export const transactionType = pgEnum("transaction_type", ["BORROW", "RETURN"]);
export const transactionStatus = pgEnum("transaction_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "RETURNED",
]);

const transaction = pgTable("borrow", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  programId: integer("program_id")
    .notNull()
    .references(() => program.id),
  approverId: uuid("approver_id").references(() => user.id),
  type: transactionType("type").notNull().default("BORROW"),
  status: transactionStatus("status").notNull().default("PENDING"),
  referenceType: varchar("reference_type", { length: 30 }),
  jidNo: varchar("jid_no", { length: 30 }),
  workCenterId: bigint("work_center_id", { mode: "number" }).references(
    () => workCenter.id
  ),
  workAreaId: bigint("work_area_id", { mode: "number" }).references(
    () => workArea.id
  ),
  totalRequestedItems: integer("total_requested_items").notNull().default(0),
  totalUnits: integer("total_units").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  checkoutDate: timestamp("checkout_date", { mode: "string" }),
  expectedReturnDate: timestamp("expected_return_date", { mode: "string" }),
  notes: text("notes"),
});

export const transactionRelations = relations(transaction, ({ one, many }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
    relationName: "userRequestedTransactions",
  }),
  approver: one(user, {
    fields: [transaction.approverId],
    references: [user.id],
    relationName: "adminApprovedTransactions",
  }),
  program: one(program, {
    fields: [transaction.programId],
    references: [program.id],
  }),
  workCenter: one(workCenter, {
    fields: [transaction.workCenterId],
    references: [workCenter.id],
  }),
  workArea: one(workArea, {
    fields: [transaction.workAreaId],
    references: [workArea.id],
  }),
  items: many(transactionItem),
  details: many(transactionDetail),
}));

export default transaction;