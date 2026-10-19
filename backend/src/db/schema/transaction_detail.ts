import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import toolUnit from "./tool_unit.ts";
import transaction from "./transaction.ts";
import transactionItem from "./transaction_item.ts";

export const detailStatus = pgEnum("transaction_detail_status", [
  "BORROWED",
  "RETURNED",
  "OVERDUE",
  "BROKEN",
  "LOST",
]);

const transactionDetail = pgTable("transaction_detail", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  transactionId: bigint("transaction_id", { mode: "bigint" })
    .notNull()
    .references(() => transaction.id, { onDelete: "cascade" }),
  transactionItemId: bigint("transaction_item_id", { mode: "bigint" }).references(
    () => transactionItem.id,
    { onDelete: "set null" }
  ),
  toolUnitId: integer("tool_id")
    .notNull()
    .references(() => toolUnit.id),
  status: detailStatus("status").notNull().default("BORROWED"),
  returnedAt: timestamp("returned_at", { mode: "string" }),
  returnNotes: text("return_notes"),
});

export const transactionDetailRelations = relations(
  transactionDetail,
  ({ one }) => ({
    transaction: one(transaction, {
      fields: [transactionDetail.transactionId],
      references: [transaction.id],
    }),
    transactionItem: one(transactionItem, {
      fields: [transactionDetail.transactionItemId],
      references: [transactionItem.id],
    }),
    toolUnit: one(toolUnit, {
      fields: [transactionDetail.toolUnitId],
      references: [toolUnit.id],
    }),
  })
);

export default transactionDetail;
