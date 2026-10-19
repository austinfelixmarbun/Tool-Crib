import { relations } from "drizzle-orm";
import { bigint, bigserial, integer, pgTable } from "drizzle-orm/pg-core";
import tool from "./tool.ts";
import transaction from "./transaction.ts";
import transactionDetail from "./transaction_detail.ts";

const transactionItem = pgTable("transaction_item", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  transactionId: bigint("transaction_id", { mode: "bigint" })
    .notNull()
    .references(() => transaction.id, { onDelete: "cascade" }),
  toolTypeId: integer("tool_type_id")
    .notNull()
    .references(() => tool.id),
  requestedQty: integer("requested_qty").notNull().default(1),
});

export const transactionItemRelations = relations(
  transactionItem,
  ({ one, many }) => ({
    transaction: one(transaction, {
      fields: [transactionItem.transactionId],
      references: [transaction.id],
    }),
    toolType: one(tool, {
      fields: [transactionItem.toolTypeId],
      references: [tool.id],
    }),
    details: many(transactionDetail),
  })
);

export default transactionItem;
