import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import tool from "./tool.ts";

export const category = pgEnum("category", ["FIXED WING", "ROTARY WING"]);

const program = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  category: category("category").notNull(),
});

export const programRelations = relations(program, ({ many }) => ({
  tools: many(tool),
}));

export default program;
