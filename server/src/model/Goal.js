const BaseModel = require('./BaseModel');

class Goal extends BaseModel {
    constructor() {
        // Enable soft delete for financial goal retention
        super('goals', { softDelete: true });
    }

    /**
     * Get SUM of monthly contributions for all ACTIVE goals.
     * This is the "committed money" deducted from S2S.
     * Returns 0 if user has no active goals (null-safe).
     */
    async getMonthlyCommitments(userId) {
        const { GOAL_STATUS } = require('../constant');
        const [rows] = await this.db.execute(
            `SELECT COALESCE(SUM(monthly_contribution), 0) as total FROM ${this.tableName} WHERE user_id = ? AND status = ? AND deleted_at IS NULL`,
            [userId, GOAL_STATUS.ACTIVE]
        );
        return rows[0].total ?? 0;
    }

    /**
     * Get the highest-value active goal (for Impact Calculator).
     * Returns undefined if no active goals exist.
     */
    async getTopActiveGoal(userId) {
        const { GOAL_STATUS } = require('../constant');
        const [rows] = await this.db.execute(
            `SELECT * FROM ${this.tableName} 
             WHERE user_id = ? AND status = ? AND deleted_at IS NULL
             ORDER BY target_amount DESC LIMIT 1`,
            [userId, GOAL_STATUS.ACTIVE]
        );
        return rows[0];
    }

    /**
     * Create a new savings goal.
     */
    async create(userId, name, targetAmount, monthlyContribution, deadline) {
        const [result] = await this.db.execute(
            `INSERT INTO ${this.tableName} (user_id, name, target_amount, monthly_contribution, deadline) VALUES (?, ?, ?, ?, ?)`,
            [userId, name, targetAmount, monthlyContribution, deadline]
        );
        return result.insertId;
    }

    /**
     * Update saved amount (ACID-safe for financial accuracy).
     * Also auto-completes the goal if target is reached.
     * Deadlock prevention: Both UPDATEs target same row (same PK), sequential lock — no deadlock.
     */
    async updateSaved(id, userId, additionalAmount) {
        const { GOAL_STATUS } = require('../constant');
        const connection = await this.db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.execute(
                `UPDATE ${this.tableName} SET current_saved = current_saved + ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
                [additionalAmount, id, userId]
            );

            // Auto-complete goal if target reached
            await connection.execute(
                `UPDATE ${this.tableName} SET status = ? WHERE id = ? AND user_id = ? AND current_saved >= target_amount AND deleted_at IS NULL`,
                [GOAL_STATUS.COMPLETED, id, userId]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new Goal();
