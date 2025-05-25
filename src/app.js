const express = require('express');
const path = require('node:path');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
app.set('title', process.env.TITLE || "Infected Arena");
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());   // Parse JSON payloads in the request body and make them available in req.body
app.use(cookieParser());
app.use("/", require('./routes/router'));

app.get('/favicon.ico', (req, res) => res.redirect('/images/favicon.ico'));

app.use("/api/images", express.static("public/images"));
app.use(express.static('public'));

module.exports = app;