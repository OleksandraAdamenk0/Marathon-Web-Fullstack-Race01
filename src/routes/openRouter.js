const express = require('express');
const authenticateAccessToken = require("../middleware/authenticateAccessToken");
const getMailboxUrl = require("../utils/getMailBoxUrl");
const router = express.Router();

router.get('/', (req, res) => {res.render('index');});
router.get('/home', (req, res) => {res.render('index');});
router.get('/index', (req, res) => {res.render('index');});

router.get('/about', (req, res) => {res.render('about');});
router.get('/rules', (req, res) => {res.render('rules');});

router.get('/registration', (req, res) => {res.render('auth', {format: 'registration'});});
router.get('/login', (req, res) => {res.render('auth', {format: 'login'});});

router.get('/profile', authenticateAccessToken, (req, res) => {res.render('profile');});

router.get('/verify-email/:email', (req, res) => {
    res.render('auth', {format: "confirm", email: req.params.email, mailBox: getMailboxUrl(req.params.email)});
});

module.exports = router;