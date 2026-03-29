import { mysqlTable, varchar, decimal, datetime, boolean, int, mysqlEnum, index, json } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const categoryTypeEnum = mysqlEnum("category_type", ["income", "expense"]);
export const goalStatusEnum = mysqlEnum("goal_status", ["active", "completed", "paused"]);
export const billStatusEnum = mysqlEnum("bill_status", ["pending", "paid", "overdue"]);

const baseModel = {
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: datetime("deleted_at"),
};

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  monthlyBudget: decimal("monthly_budget", { precision: 15, scale: 2 }).default("0.00"),
  emergencyBuffer: decimal("emergency_buffer", { precision: 15, scale: 2 }).default("200000.00"),
  incomeDate: int("income_date").default(1),
  createdAt: datetime("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 10 }),
  color: varchar("color", { length: 20 }),
  type: mysqlEnum("type", ["income", "expense"]).default("expense"),
  ...baseModel,
});

export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  note: varchar("note", { length: 255 }),
  date: datetime("date").default(sql`(CURRENT_TIMESTAMP)`),
  isOcrVerified: boolean("is_ocr_verified").default(false),
  createdAt: datetime("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  ...baseModel,
}, (table) => {
  return {
    userIdIdx: index("tx_user_id_idx").on(table.userId),
    dateIdx: index("tx_date_idx").on(table.date),
  };
});

export const fixedCosts = mysqlTable("fixed_costs", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 10 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: int("due_date").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending"),
  category: varchar("category", { length: 100 }),
  isPaid: boolean("is_paid").default(false),
  ...baseModel,
});

export const goals = mysqlTable("goals", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 10 }),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentSaved: decimal("current_saved", { precision: 15, scale: 2 }).default("0.00"),
  monthlyContribution: decimal("monthly_contribution", { precision: 15, scale: 2 }),
  deadline: datetime("deadline"),
  status: mysqlEnum("status", ["active", "completed", "paused"]).default("active"),
  ...baseModel,
});
