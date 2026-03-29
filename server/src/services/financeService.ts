import crypto from "node:crypto";
import { db } from "../db/index.js";
import { users, categories, transactions, fixedCosts, goals } from "../db/schema.js";
import { eq, and, gte, lt, sum, sql, desc, ne } from "drizzle-orm";

export class FinanceService {
  private notDeleted = eq(transactions.isDeleted, false);

  public async getDashboardData(userId: string) {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) throw { status: 404, message: "User not found" };

    const incomeQuery = await db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), this.notDeleted, sql`CAST(${transactions.amount} AS decimal) > 0`));
    
    const expenseQuery = await db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), this.notDeleted, sql`CAST(${transactions.amount} AS decimal) < 0`));

    const totalIncome = Number(incomeQuery[0]?.total || 0);
    const totalExpense = Math.abs(Number(expenseQuery[0]?.total || 0));
    const balance = totalIncome - totalExpense;

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance,
      safe_to_spend: balance - Number(user[0].emergencyBuffer || 200000),
      monthly_budget: Number(user[0].monthlyBudget || 0),
    };
  }

  public async getMonthlyTrend(userId: string) {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const stats = await db.select({
        income: sum(sql`CASE WHEN CAST(${transactions.amount} AS decimal) > 0 THEN CAST(${transactions.amount} AS decimal) ELSE 0 END`),
        expense: sum(sql`CASE WHEN CAST(${transactions.amount} AS decimal) < 0 THEN ABS(CAST(${transactions.amount} AS decimal)) ELSE 0 END`),
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), this.notDeleted, gte(transactions.date, start), lt(transactions.date, end)));

      result.push({
        month: `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getFullYear()).slice(-2)}`,
        income: Number(stats[0]?.income || 0),
        expense: Number(stats[0]?.expense || 0),
      });
    }
    return result;
  }
}

export const financeService = new FinanceService();
