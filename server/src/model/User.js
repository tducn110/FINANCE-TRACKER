const BaseModel = require('./BaseModel');

class User extends BaseModel {
    constructor() { 
        super('users'); 
    }

    async findByUsername(username) {
        const [rows] = await this.db.execute(`SELECT * FROM ${this.tableName} WHERE username = ?`, [username]);
        return rows[0];
    }

    async create(username, passwordHash) {
        const [result] = await this.db.execute(
            `INSERT INTO ${this.tableName} (username, password) VALUES (?, ?)`, 
            [username, passwordHash]
        );
        return result.insertId;
    }
}

module.exports = new User();
