const BaseModel = require('./BaseModel');

class UserSettings extends BaseModel {
    constructor() {
        super('user_settings');
    }

    /**
     * Find settings row for a specific user.
     * Returns undefined if no settings exist yet.
     */
    async findByUserId(userId) {
        const [rows] = await this.db.execute(
            `SELECT * FROM ${this.tableName} WHERE user_id = ?`, [userId]
        );
        return rows[0];
    }

    /**
     * Create a default settings row for a newly registered user.
     * Called automatically during registration to ensure S2S works immediately.
     */
    async createDefault(userId) {
        const [result] = await this.db.execute(
            `INSERT INTO ${this.tableName} (user_id, emergency_buffer, income_date, monthly_budget) VALUES (?, 0.00, 1, 0.00)`,
            [userId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Update user settings (emergency buffer, income date, budget).
     */
    async update(userId, settings) {
        const { emergency_buffer, income_date, monthly_budget } = settings;
        const [result] = await this.db.execute(
            `UPDATE ${this.tableName} SET emergency_buffer = ?, income_date = ?, monthly_budget = ? WHERE user_id = ?`,
            [emergency_buffer, income_date, monthly_budget, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new UserSettings();
