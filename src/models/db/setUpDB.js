require('dotenv').config();
const mysql = require('mysql2');
const {cardsData, leaderData, spellData, energyData} = require('./cardsData');
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
        avatar_url VARCHAR(255) DEFAULT 'uploads/avatars/default.png',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('user', 'admin') DEFAULT 'user',
        emailStatus TINYINT(1) DEFAULT 0
    );
`;

const createRoomsTableSQL = `
    CREATE TABLE IF NOT EXISTS rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        player_one_id INT NOT NULL,
        player_two_id INT,
        winner_id INT,
        code VARCHAR(10) UNIQUE DEFAULT NULL,
        status ENUM('waiting', 'in-progress', 'finished') DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        current_turn_player_id INT DEFAULT NULL,
        FOREIGN KEY (player_one_id) REFERENCES users(id),
        FOREIGN KEY (player_two_id) REFERENCES users(id)
    )
`

const createPlayersTableSQL = `
    CREATE TABLE IF NOT EXISTS players (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        room_id INT NOT NULL,
        role ENUM('survivor', 'infected') NOT NULL,
        health INT NOT NULL DEFAULT 10,
        energy INT NOT NULL DEFAULT 10,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
`

const createCardsTableSQL = `
    CREATE TABLE IF NOT EXISTS cards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        image_url VARCHAR(255) UNIQUE,
        attack INT NOT NULL,
        defense INT NOT NULL,
        cost INT NOT NULL,
        team_type ENUM('survivors', 'infected'),
        card_type ENUM('creature', 'spell', 'leader', 'energy_farmer'),
        description VARCHAR(255) DEFAULT NULL,
        deck_quantity INT NOT NULL DEFAULT 1
    )
`;


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
`;

const createPlayersCardsTableSQL = `
    CREATE TABLE IF NOT EXISTS players_cards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        player_id INT NOT NULL,
        card_id INT NOT NULL,
        room_id INT NOT NULL,
        zone ENUM('deck', 'hand', 'board', 'farm', 'leader', 'discard') NOT NULL,
        position INT DEFAULT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        instance_number INT NOT NULL DEFAULT 1,
        UNIQUE KEY unique_card_instance (player_id, room_id, card_id, instance_number),
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
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
        .then(() => executeQuery(connection, createUsersTableSQL))
        .then(() => executeQuery(connection, createCardsTableSQL))
        .then(() => executeQuery(connection, createRoomsTableSQL))
        .then(() => executeQuery(connection, createPlayersTableSQL))
        .then(() => executeQuery(connection, createBattleLogsTableSQL))
        .then(() => executeQuery(connection, createPlayersCardsTableSQL))
        .then(() => executeQuery(connection, cardsData))
        .then(() => console.log('Successfully set up DB'))
        .catch((err) => console.error("Error during MySQL setup: ", err))
        .finally(() => connection.end());
}

setUpDB();
