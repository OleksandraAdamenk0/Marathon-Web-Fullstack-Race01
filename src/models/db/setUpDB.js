require('dotenv').config();
const mysql = require('mysql2');
const executeQuery = require("./executeQuery");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: 'root',
    password: process.env.DB_ROOT_PASSWORD,
    multipleStatements: true
});

const dbName = process.env.DB;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;

const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        isEmailVerified BOOLEAN DEFAULT FALSE,
        emailVerificationToken VARCHAR(255),
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

function setUpDB() {
    executeQuery(connection, `CREATE DATABASE IF NOT EXISTS ${dbName};`)
        .then(() => executeQuery(connection, `DROP USER IF EXISTS ${dbUser}@'localhost';`))
        .then(() => executeQuery(connection, `CREATE USER '${dbUser}'@'localhost' IDENTIFIED BY '${dbPass}';`))
        .then(() => executeQuery(connection, `GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost';`))
        .then(() => `FLUSH PRIVILEGES;`)
        .then(() => new Promise((resolve, reject) => {
            connection.changeUser({ database: dbName }, (err) => {
                if (err) reject(new Error("Error switching to the new database: " + err.message));
                else resolve();
            });
        }))
        .then(() => executeQuery(connection, createTableSQL))
        .then(() => console.log('Successfully set up DB'))
        .catch((err) => console.error("Error during MySQL setup: ", err))
        .finally(() => connection.end());
}

setUpDB();