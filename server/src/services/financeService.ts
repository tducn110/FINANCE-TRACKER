import crypto from "node:crypto";
import { db } from "../db/index.js";
import { users, categories, transactions, fixedCosts, goals } from "../db/schema.js";
import { eq, and, gte, lt, sum, sql, desc, ne } from "drizzle-orm";

export class FinanceService {
  private notDeleted = eq(transactions.isDeleted, false);

  public async getDashboardData(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw { status: 404, message: "User not found" };

    const result = await db.select({
      income: sum(sql`CASE WHEN CAST(${transactions.amount} AS decimal) > 0 THEN CAST(${transactions.amount} AS decimal) ELSE 0 END`),
      expense: sum(sql`CASE WHEN CAST(${transactions.amount} AS decimal) < 0 THEN ABS(CAST(${transactions.amount} AS decimal)) ELSE 0 END`),
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), this.notDeleted));

    const totalIncome = Number(result[0]?.income || 0);
    const totalExpense = Number(result[0]?.expense || 0);

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      monthly_budget: Number(user.monthlyBudget || 0),
    };
  }

  public async getSafeToSpend(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const dashboard = await this.getDashboardData(userId);
    const monthlyBudget = Number(user?.monthlyBudget || 5000000); // 5M VND fallback
    const emergencyBuffer = Number(user?.emergencyBuffer || 200000);
    
    return {
      safeToSpend: Math.max(monthlyBudget - dashboard.total_expense - emergencyBuffer, 0),
      monthlyBudget,
      emergencyBuffer
    };
  }

  public async getMascotStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate today's spending
    const todayResult = await db.select({
      total: sum(sql`ABS(CAST(${transactions.amount} AS decimal))`)
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId), 
      this.notDeleted, 
      gte(transactions.date, today),
      sql`CAST(${transactions.amount} AS decimal) < 0`
    ));

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const monthlyBudget = Number(user?.monthlyBudget || 5000000);
    const dailyLimit = Math.floor(monthlyBudget / 30);
    const todayExpense = Number(todayResult[0]?.total || 0);

    return {
      todayExpense,
      dailyLimit,
      isOverLimit: todayExpense > dailyLimit,
      mascotMood: todayExpense > dailyLimit ? "STRESSED" : "HAPPY"
    };
  }

  public async getCategories() {
    return await db.select().from(categories).where(eq(categories.isDeleted, false));
  }

  public async getTransactions(userId: string) {
    return await db.select({
      id: transactions.id,
      amount: transactions.amount,
      note: transactions.note,
      date: transactions.date,
      categoryName: categories.name,
      categoryIcon: categories.icon
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(eq(transactions.userId, userId), this.notDeleted))
    .orderBy(desc(transactions.date))
    .limit(50);
  }

  public async addTransaction(userId: string, data: { amount: number; note: string; category_id: string }) {
    return await db.insert(transactions).values({
      id: crypto.randomUUID(),
      userId,
      categoryId: data.category_id,
      amount: String(data.amount),
      note: data.note,
      date: new Date(),
    });
  }

  public async getMonthlyTrend(userId: string) {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const year = now.getFullYear();
      const month = now.getMonth() - i;
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);
      
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
