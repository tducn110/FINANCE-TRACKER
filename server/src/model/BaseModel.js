const db = require('../config/db');

/**
 * OOP: Abstract base class for all Models.
 * Provides shared CRUD operations via inheritance.
 * All child models call super('tableName', { softDelete }) to configure behavior.
 */
class BaseModel {
    constructor(tableName, options = {}) {
        this.tableName = tableName;
        this.db = db;
        this.softDelete = options.softDelete || false;
    }

    /**
     * Build WHERE clause fragment for soft delete filtering.
     * Tables with softDelete=true will auto-exclude deleted rows.
     */
    _activeFilter(alias = '') {
        if (!this.softDelete) return '';
        const prefix = alias ? `${alias}.` : '';
        return ` AND ${prefix}deleted_at IS NULL`;
    }

    // Fetch all rows with a safety LIMIT to prevent memory overload
    async findAll(limit = 100) {
        const filter = this.softDelete ? 'WHERE deleted_at IS NULL' : '';
        const [rows] = await this.db.execute(
            `SELECT * FROM ${this.tableName} ${filter} LIMIT ?`, [String(limit)]
        );
        return rows;
    }

    // Find by Primary Key (O(1) via PK index)
    async findById(id) {
        const filter = this.softDelete ? 'AND deleted_at IS NULL' : '';
        const [rows] = await this.db.execute(
            `SELECT * FROM ${this.tableName} WHERE id = ? ${filter}`, [id]
        );
        return rows[0];
    }

    // Find all rows belonging to a specific user
    async findByUserId(userId) {
        const filter = this.softDelete ? 'AND deleted_at IS NULL' : '';
        const [rows] = await this.db.execute(
            `SELECT * FROM ${this.tableName} WHERE user_id = ? ${filter}`, [userId]
        );
        return rows;
    }

    /**
     * Soft Delete: Sets deleted_at = NOW(). Data retained for RETENTION_DAYS.
     * Hard Delete: Permanently removes row (used for non-financial tables).
     */
    async delete(id) {
        if (this.softDelete) {
            const [result] = await this.db.execute(
                `UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`, [id]
            );
            return result.affectedRows > 0;
        }
        const [result] = await this.db.execute(
            `DELETE FROM ${this.tableName} WHERE id = ?`, [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Restore a soft-deleted row (within retention window).
     */
    async restore(id) {
        if (!this.softDelete) return false;
        const [result] = await this.db.execute(
            `UPDATE ${this.tableName} SET deleted_at = NULL WHERE id = ?`, [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = BaseModel;