const BaseModel = require('./BaseModel');

class UserSettings extends BaseModel {
    constructor() { 
        super('user_settings'); 
    }

    async findByUserId(userId) {
        const [rows] = await this.db.execute(`SELECT * FROM ${this.tableName} WHERE user_id = ?`, [userId]);
        return rows[0];
    }
}

module.exports = new UserSettings();
