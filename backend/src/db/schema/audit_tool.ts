import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  integer,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import audit from "./audit.ts";
import tool from "./tool.ts";

const auditTool = pgTable("audit_items", {
  id: bigserial("audit_items", { mode: "number" }).primaryKey(),
  auditId: bigint("audit_id", { mode: "number" })
    .notNull()
    .references(() => audit.id),
  toolId: integer("tool_type_id")
    .notNull()
    .references(() => tool.id),
  auditStatus: varchar("audit_status", { length: 20 }).notNull(),
  toolQty: integer("tool_qty").notNull(),
  toolNotes: text("tool_notes"),
});

export const auditToolRelations = relations(auditTool, ({ one }) => ({
  audit: one(audit, { fields: [auditTool.auditId], references: [audit.id] }),
  tool: one(tool, {
    fields: [auditTool.toolId],
    references: [tool.id],
  }),
}));

export default auditTool;
