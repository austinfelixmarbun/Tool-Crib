import { relations } from "drizzle-orm";
import {
  bigserial,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import auditTool from "./audit_tool.ts";
import user from "./user.ts";

const audit = pgTable("audit", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  auditorId: uuid("auditor_id")
    .notNull()
    .references(() => user.id),
  sampleQty: integer("sample_qty").notNull(),
  notes: text("notes"),
  auditDate: timestamp("auditDate", {mode: 'string'}).notNull().defaultNow(),
});

export const auditRelations = relations(audit, ({ one, many }) => ({
  users: one(user, { fields: [audit.auditorId], references: [user.id] }),
  auditTools: many(auditTool),
}));

export default audit;