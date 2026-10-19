import { relations } from "drizzle-orm";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import transaction from "./transaction.ts";
import user from "./user.ts";

const workCenter = pgTable("work_centers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  orgCode: varchar("org_code", { length: 10 }).notNull(),
});

export const workCenterRelations = relations(workCenter, ({ many }) => ({
  users: many(user),
  transactions: many(transaction),
}));

export default workCenter;