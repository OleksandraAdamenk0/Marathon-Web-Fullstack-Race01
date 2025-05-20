const bcrypt = require('bcryptjs');
const Model = require("./Model");

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
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
            return await this.getById(result.insertId);
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
        console.log(id, user);
        if (!user) return false;
        console.log(user.emailStatus);
        return user.emailStatus === 1;
    }

    async verifyUserEmail(id) {
        const result = this.query(`UPDATE users SET emailStatus = 1 WHERE id = ?`, [id]);
        return result.affectedRows !== 0;
    }

    async setPassword(id, password) {
        const hashedPassword = await hashPassword(password);
        const result = this.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hashedPassword, id]);
        return result.affectedRows !== 0;
    }

}

module.exports = User;