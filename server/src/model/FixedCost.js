const BaseModel = require('./BaseModel');

class FixedCost extends BaseModel {
    constructor() {
        super('fixed_costs');
    }

    /**
     * Get SUM of all non-paid bills for the S2S Engine.
     * Includes both PENDING and OVERDUE bills.
     * Returns 0 if no unpaid bills exist (null-safe).
     */
    async getUnpaidBills(userId) {
        const { FIXED_COST_STATUS } = require('../constant');
        const [rows] = await this.db.execute(
            `SELECT COALESCE(SUM(amount), 0) as total FROM ${this.tableName} WHERE user_id = ? AND status != ?`,
            [userId, FIXED_COST_STATUS.PAID]
        );
        return rows[0].total ?? 0;
    }

    /**
     * Create a new fixed cost entry.
     */
    async create(userId, name, amount, dueDate) {
        const [result] = await this.db.execute(
            `INSERT INTO ${this.tableName} (user_id, name, amount, due_date) VALUES (?, ?, ?, ?)`,
            [userId, name, amount, dueDate]
        );
        return result.insertId;
    }

    /**
     * Mark a bill as PAID (ACID-safe, updates timestamp).
     * Deadlock prevention: Single UPDATE on single row, no cross-table lock.
     */
    async markAsPaid(id, userId) {
        const { FIXED_COST_STATUS } = require('../constant');
        const connection = await this.db.getConnection();
        await connection.beginTransaction();

        try {
            const [result] = await connection.execute(
                `UPDATE ${this.tableName} SET status = ?, last_paid_at = NOW() WHERE id = ? AND user_id = ?`,
                [FIXED_COST_STATUS.PAID, id, userId]
            );
            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Mark overdue bills: Any bill with due_date < today and status = PENDING.
     * Called before S2S calculation to ensure accurate data.
     */
    async markOverdue(userId) {
        const { FIXED_COST_STATUS } = require('../constant');
        const today = new Date().getDate();
        const [result] = await this.db.execute(
            `UPDATE ${this.tableName} SET status = ? WHERE user_id = ? AND status = ? AND due_date < ?`,
            [FIXED_COST_STATUS.OVERDUE, userId, FIXED_COST_STATUS.PENDING, today]
        );
        return result.affectedRows;
    }

    /**
     * Reset all bills to PENDING (for monthly cycle reset).
     */
    async resetMonthly(userId) {
        const { FIXED_COST_STATUS } = require('../constant');
        const [result] = await this.db.execute(
            `UPDATE ${this.tableName} SET status = ? WHERE user_id = ?`,
            [FIXED_COST_STATUS.PENDING, userId]
        );
        return result.affectedRows;
    }
}

module.exports = new FixedCost();
