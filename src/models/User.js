const bcrypt = require('bcryptjs');
const executeQuery = require("./db/executeQuery");
const connection = require("./db/db");
const Model = require("./Model");
const {query} = require("express");

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

const createUser = async (email, username, password) => {
    const hashedPassword = await hashPassword(password);
    const query = `INSERT INTO users (email, username, password) VALUES (?, ?, ?)`;

    try {
        const result = await executeQuery(connection, query, [email, username, hashedPassword]);
        const userId = result.insertId;
        const user = await getUserById(userId);
        console.log('User created successfully: ', result);
        return user;
    } catch (error) {
        console.log("Error creating user: ", error);
        return null;
    }
}

async function verifyUserEmail(userId) {
    const query = `UPDATE users SET isEmailVerified = TRUE WHERE id = ?`;
    await executeQuery(connection, query, [userId]);
}

class User extends Model {
    constructor() {
        super("users");
    }

    async getUserByUsername(username) {
        const result = await this.query(`SELECT * FROM users WHERE username = ?`, [username]);
        if (result.length === 0) return null;
        return result[0];
    }

    async getUserByEmail(email) {
        const result = await this.query(`SELECT * FROM users WHERE email = ?`, [email]);
        if (result.length === 0) return null;
        return result[0];
    }

    async createUser(email, username, password){
        const hashedPassword = await hashPassword(password);
        const query = `INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)`;

        try {
            const result = await this.query(query, [email, username, hashedPassword]);
            if (!result) return null
            return await this.getUserByEmail(email);
        } catch (error) {
            console.log("Error creating user: ", error);
            return null;
        }
    }

    async comparePassword(password, id) {
        const user = await this.getById(id);
        if (!user) return false;
        return bcrypt.compare(password, user.password_hash);
    }

    async isEmailVerified(id) {
        const user = await this.getById(id);
        if (!user) return false;
        return Boolean(user.emailStatus);
    }

    async verifyUserEmail(id) {
        const result = this.query(`UPDATE users SET emailStatus = 1 WHERE id = ?`, [id]);
        return result.affectedRows !== 0;

    }

}

module.exports = User;