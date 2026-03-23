const db = require('../config/db');

class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.db = db;
    }

    // Lấy tất cả dữ liệu (DSA: O(n))
    async findAll() {
        const [rows] = await this.db.execute(`SELECT * FROM ${this.tableName}`);
        return rows;
    }

    // Tìm theo ID (DSA: O(1) nhờ Index của MySQL)
    async findById(id) {
        const [rows] = await this.db.execute(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
        return rows[0];
    }

    // Xóa theo ID
    async delete(id) {
        const [result] = await this.db.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = BaseModel;