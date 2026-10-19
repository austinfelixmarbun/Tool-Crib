import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import tool from "./tool.ts";
import transactionDetail from "./transaction_detail.ts";

export const toolUnitStatus = pgEnum("tool_unit_status", [
  "READY",
  "BORROWED",
  "INSPECTION",
  "MAINTANANCE",
  "SCRAPPED",
]);

const toolUnit = pgTable("tool", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_type_id")
    .notNull()
    .references(() => tool.id),
  seqNo: varchar("seq_no", { length: 5 }).notNull(),
  status: toolUnitStatus("status").notNull().default("READY"),
});

export const toolUnitRelations = relations(toolUnit, ({ one, many }) => ({
  tool: one(tool, {
    fields: [toolUnit.toolId],
    references: [tool.id],
  }),
  details: many(transactionDetail),
}));

export default toolUnit;
