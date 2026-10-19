import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import auditTool from "./audit_tool.ts";
import program from "./program.ts";
import toolUnit from "./tool_unit.ts";
import transactionItem from "./transaction_item.ts";

const tool = pgTable("tool_type", {
  id: serial("id").primaryKey(),
  toolNumber: varchar("tool_number", { length: 30 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  programId: integer("program_id")
    .notNull()
    .references(() => program.id),
  description: varchar("description", { length: 255 }),
  qcPeriode: integer("qcPeriode"), // In months
  location: varchar("location", { length: 100 }).notNull(),
});

export const toolRelations = relations(tool, ({ one, many }) => ({
  program: one(program, {
    fields: [tool.programId],
    references: [program.id],
  }),
  units: many(toolUnit),
  transactionItems: many(transactionItem),
  auditTools: many(auditTool),
}));

export default tool;
