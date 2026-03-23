const BaseModel = require('./BaseModel');

class Transaction extends BaseModel {
    constructor() {
        super('transactions'); // Chỉ định bảng 'transactions' trong MySQL
    }

    // Logic Quick Add sử dụng kết quả từ Regex Helper
    async quickCreate(amount, note, categoryId, userId) {
        const sql = `INSERT INTO ${this.tableName} (amount, note, category_id, user_id) VALUES (?, ?, ?, ?)`;
        const [result] = await this.db.execute(sql, [amount, note, categoryId, userId]);
        return result.insertId;
    }

    // Nâng cấp: Chèn dữ liệu theo tiêu chuẩn ACID 
    async quickCreateWithTransaction(amount, note, categoryId, userId) {
        const connection = await this.db.getConnection();
        await connection.beginTransaction(); // Bắt đầu chế độ bảo vệ

        try {
            const sql = `INSERT INTO ${this.tableName} (amount, note, category_id, user_id) VALUES (?, ?, ?, ?)`;
            const [result] = await connection.execute(sql, [amount, note, categoryId, userId]);
            
            // Nếu sau này có Update Balance, thực hiện tại đây
            // await connection.execute(`UPDATE user_settings SET ...`);

            await connection.commit(); // Thành công thì chốt sổ
            return result.insertId;
        } catch (error) {
            await connection.rollback(); // Lỗi thì đảo ngược an toàn
            throw error;
        } finally {
            connection.release(); // Trả lại kết nối cho Pool
        }
    }

    // [DSA: Khuyến nghị đánh INDEX(user_id, category_id) ở database để Complexity là O(log N)]
    async getTotalIncome(userId) {
        const { CATEGORY } = require('../constant');
        const [rows] = await this.db.execute(
            `SELECT SUM(amount) as total FROM ${this.tableName} WHERE user_id = ? AND category_id = ?`, 
            [userId, CATEGORY.INCOME]
        );
        return rows[0].total || 0;
    }

    async getTotalExpense(userId) {
        const { CATEGORY } = require('../constant');
        const [rows] = await this.db.execute(
            `SELECT SUM(amount) as total FROM ${this.tableName} WHERE user_id = ? AND category_id != ?`, 
            [userId, CATEGORY.INCOME]
        );
        return rows[0].total || 0;
    }

    async getTodayExpense(userId) {
        const { CATEGORY } = require('../constant');
        const [rows] = await this.db.execute(
            `SELECT SUM(amount) as total FROM ${this.tableName} WHERE user_id = ? AND category_id != ? AND DATE(created_at) = CURDATE()`, 
            [userId, CATEGORY.INCOME]
        );
        return rows[0].total || 0;
    }
}

module.exports = new Transaction(); // Export dạng Singleton