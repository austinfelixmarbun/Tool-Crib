import { relations } from "drizzle-orm";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import transaction from "./transaction.ts";
import user from "./user.ts";

const workArea = pgTable("work_areas", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 100 }).notNull(),
});

export const workAreaRelations = relations(workArea, ({ many }) => ({
  users: many(user),
  transactions: many(transaction),
}));

export default workArea;