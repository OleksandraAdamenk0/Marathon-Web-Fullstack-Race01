const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
});

connection.connect((err) => {
    if (err) console.log("Error connecting database: ", err);
    else console.log("Connected to the DB!");
});

module.exports = connection;