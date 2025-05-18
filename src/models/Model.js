const pool = require('./db/db.js');

class Model {
    constructor(tableName) {
        this.table = tableName;
    }

    async getAll() {
        const [rows] = await pool.promise().query(`SELECT * FROM \`${this.table}\``);
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.promise().query(`SELECT * FROM \`${this.table}\` WHERE id = ?`, [id]);
        return rows[0];
    }

    async deleteById(id) {
        const [result] = await pool.promise().query(`DELETE FROM \`${this.table}\` WHERE id = ?`, [id]);
        return result.affectedRows;
    }

    async query(sql, params = []) {
        const [rows] = await pool.promise().query(sql, params);
        return rows;
    }
}

module.exports = Model;