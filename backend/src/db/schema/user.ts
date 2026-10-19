import { relations, sql } from "drizzle-orm";
import {
  bigint,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import audit from "./audit.ts";
import transaction from "./transaction.ts";
import workArea from "./work_area.ts";
import workCenter from "./work_center.ts";

export const userRole = pgEnum("role", [
  "SUPER ADMIN",
  "ADMIN",
  "QUALITY CONTROL",
  "USER",
]);

export const userStatus = pgEnum("status", ["ACTIVE", "INACTIVE"]);

const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workCenterId: bigint("work_center_id", { mode: "number" })
      .notNull()
      .references(() => workCenter.id),
    workAreaId: bigint("work_area_id", { mode: "number" })
      .notNull()
      .references(() => workArea.id),
    employeeId: bigint("employee_id", { mode: "number" }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 50 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    role: userRole("role").default("USER").notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    status: userStatus("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueSingleSuperAdmin: uniqueIndex("unique_single_super_admin")
      .on(table.role)
      .where(sql`${table.role} = 'SUPER ADMIN'`),
  })
);

export const userRelations = relations(user, ({ one, many }) => ({
  workCenter: one(workCenter, {
    fields: [user.workCenterId],
    references: [workCenter.id],
  }),
  workArea: one(workArea, {
    fields: [user.workAreaId],
    references: [workArea.id],
  }),
  requestedTransactions: many(transaction, {
    relationName: "userRequestedTransactions",
  }),
  approvedTransactions: many(transaction, {
    relationName: "adminApprovedTransactions",
  }),
  audits: many(audit),
}));

export default user;