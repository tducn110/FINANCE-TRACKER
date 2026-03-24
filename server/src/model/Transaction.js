const BaseModel = require('./BaseModel');

class Transaction extends BaseModel {
    constructor() {
        // Enable soft delete for financial data retention
        super('transactions', { softDelete: true });
    }

    /**
     * Helper: Get the first and last moment of the current month.
     * Used for Range queries that preserve B-Tree Index (avoids MONTH() anti-pattern).
     */
    _getCurrentMonthRange() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return {
            start: start.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10)
        };
    }

    /**
     * Helper: Get today's date range for daily queries.
     */
    _getTodayRange() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return {
            start: start.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10)
        };
    }

    /**
     * ACID-safe transaction creation.
     * Uses BEGIN/COMMIT/ROLLBACK to guarantee data integrity.
     * Deadlock prevention: Single INSERT, no cross-table locking.
     */
    async create(amount, note, categoryId, userId) {
        const connection = await this.db.getConnection();
        await connection.beginTransaction();

        try {
            const sql = `INSERT INTO ${this.tableName} (amount, note, category_id, user_id) VALUES (?, ?, ?, ?)`;
            const [result] = await connection.execute(sql, [amount, note, categoryId, userId]);

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Get total INCOME for the CURRENT MONTH only.
     * FIX: Uses Range query instead of MONTH() to preserve B-Tree Index.
     * DSA: O(log n) via INDEX(user_id, category_id).
     */
    async getTotalIncome(userId) {
        const { CATEGORY } = require('../constant');
        const { start, end } = this._getCurrentMonthRange();
        const [rows] = await this.db.execute(
            `SELECT COALESCE(SUM(amount), 0) as total FROM ${this.tableName} 
             WHERE user_id = ? AND category_id = ? 
             AND created_at >= ? AND created_at < ?
             AND deleted_at IS NULL`,
            [userId, CATEGORY.INCOME, start, end]
        );
        return rows[0].total ?? 0;
    }

    /**
     * Get total EXPENSE for the CURRENT MONTH only.
     * FIX: Range query preserves Index. Excludes income category.
     */
    async getTotalExpense(userId) {
        const { CATEGORY } = require('../constant');
        const { start, end } = this._getCurrentMonthRange();
        const [rows] = await this.db.execute(
            `SELECT COALESCE(SUM(amount), 0) as total FROM ${this.tableName} 
             WHERE user_id = ? AND category_id != ? 
             AND created_at >= ? AND created_at < ?
             AND deleted_at IS NULL`,
            [userId, CATEGORY.INCOME, start, end]
        );
        return rows[0].total ?? 0;
    }

    /**
     * Get total expense for TODAY only (used by Mascot daily limit).
     * FIX: Range query instead of DATE() function wrapper.
     */
    async getTodayExpense(userId) {
        const { CATEGORY } = require('../constant');
        const { start, end } = this._getTodayRange();
        const [rows] = await this.db.execute(
            `SELECT COALESCE(SUM(amount), 0) as total FROM ${this.tableName} 
             WHERE user_id = ? AND category_id != ? 
             AND created_at >= ? AND created_at < ?
             AND deleted_at IS NULL`,
            [userId, CATEGORY.INCOME, start, end]
        );
        return rows[0].total ?? 0;
    }

    /**
     * Get recent transactions for a user (for Frontend dashboard).
     * FIX: Now supports pagination via page + limit params.
     */
    async getRecentByUserId(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [rows] = await this.db.execute(
            `SELECT t.*, c.name as category_name, c.icon as category_icon 
             FROM ${this.tableName} t
             LEFT JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = ? AND t.deleted_at IS NULL
             ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
            [userId, String(limit), String(offset)]
        );
        return rows;
    }
}

module.exports = new Transaction();