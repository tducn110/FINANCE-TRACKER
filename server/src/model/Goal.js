const BaseModel = require('./BaseModel');

class Goal extends BaseModel {
    constructor() { 
        super('goals'); 
    }

    // Lấy tổng tiền cần cống hiến cho các mục tiêu trong tháng
    async getMonthlyCommitments(userId) {
        const { GOAL_STATUS } = require('../constant');
        const [rows] = await this.db.execute(
            `SELECT SUM(monthly_contribution) as total FROM ${this.tableName} WHERE user_id = ? AND status = ?`, 
            [userId, GOAL_STATUS.ACTIVE]
        );
        return rows[0].total || 0;
    }

    // Lấy mục tiêu quan trọng nhất đang active
    async getTopActiveGoal(userId) {
        const { GOAL_STATUS } = require('../constant');
        const [rows] = await this.db.execute(`
            SELECT * FROM ${this.tableName} 
            WHERE user_id = ? AND status = ? 
            ORDER BY target_amount DESC LIMIT 1
        `, [userId, GOAL_STATUS.ACTIVE]);
        return rows[0];
    }
}

module.exports = new Goal();
