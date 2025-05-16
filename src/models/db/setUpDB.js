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

const createUsersTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT '/avatar.png',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('user', 'admin') DEFAULT 'user',
        emailStatus TINYINT(1) DEFAULT 0
    );
`;

const createRoomsTableSQL = `
    CREATE TABLE IF NOT EXISTS rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        player_one_id INT NOT NULL,
        player_two_id INT NOT NULL,
        winner_id INT,
        status ENUM('waiting', 'in-progress', 'finished') DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_one_id) REFERENCES users(id),
        FOREIGN KEY (player_two_id) REFERENCES users(id)
    )
`

const createUsersCardsTableSQL = `
    CREATE TABLE IF NOT EXISTS users_cards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        card_id INT NOT NULL,
        room_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (card_id) REFERENCES cards(id),
        FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
`

const createCardsTableSQL = `
    CREATE TABLE IF NOT EXISTS cards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        image_url VARCHAR(255) UNIQUE DEFAULT '/default-card.png',
        attack INT NOT NULL,
        defense INT NOT NULL,
        heal INT NOT NULL,
        cost INT NOT NULL
    )
`

const createBattleLogsTableSQL = `
    CREATE TABLE IF NOT EXISTS battle_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        room_id INT NOT NULL,
        user_id INT NOT NULL,
        action VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`

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
        .then(() => executeQuery(connection, createUsersTableSQL))
        .then(() => executeQuery(connection, createCardsTableSQL))
        .then(() => executeQuery(connection, createRoomsTableSQL))
        .then(() => executeQuery(connection, createUsersCardsTableSQL))
        .then(() => executeQuery(connection, createBattleLogsTableSQL))
        .then(() => console.log('Successfully set up DB'))
        .catch((err) => console.error("Error during MySQL setup: ", err))
        .finally(() => connection.end());
}

setUpDB();