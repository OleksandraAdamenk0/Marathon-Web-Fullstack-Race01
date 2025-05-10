const bcrypt = require('bcryptjs');
const executeQuery = require("./db/executeQuery");
const connection = require("./db/connectDB");

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

const getUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    const result = await executeQuery(connection, query, [email]);
    return result[0];
}

async function getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const results = await executeQuery(connection, query, [id]);
    return results[0];
}

async function verifyUserEmail(userId) {
    const query = `UPDATE users SET isEmailVerified = TRUE WHERE id = ?`;
    await executeQuery(connection, query, [userId]);
}

module.exports = {
    createUser,
    getUserByEmail,
    comparePassword,
    getUserById,
    verifyUserEmail,
};