const BaseModel = require('./BaseModel');

class FixedCost extends BaseModel {
    constructor() { 
        super('fixed_costs'); 
    }

    // Logic lấy các hóa đơn tháng này chưa đóng
    async getUnpaidBills(userId) {
        const [rows] = await this.db.execute(
            `SELECT SUM(amount) as total FROM ${this.tableName} WHERE user_id = ? AND is_paid = FALSE`, 
            [userId]
        );
        return rows[0].total || 0;
    }
}

module.exports = new FixedCost();
