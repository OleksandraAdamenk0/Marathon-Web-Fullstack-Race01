const express = require('express');
const authenticateAccessToken = require("../middleware/authenticateAccessToken");
const getUserProfileController = require("../controllers/getUserProfileController");
const getMailboxUrl = require("../utils/getMailBoxUrl");
const getMenuController = require('../controllers/getMenuController');
const roomController = require('../controllers/roomControllers/roomController');

const router = express.Router();

router.get('/', (req, res) => {res.render('index');});
router.get('/home', (req, res) => {res.render('index');});
router.get('/index', (req, res) => {res.render('index');});

router.get('/menu', authenticateAccessToken, getMenuController);

router.get('/registration', (req, res) => {res.render('auth', {format: 'registration'});});
router.get('/login', (req, res) => {res.render('auth', {format: 'login'});});

router.get('/room/:roomId', authenticateAccessToken, roomController);

router.get('/profile/:id', authenticateAccessToken, getUserProfileController);

router.get('/verify-email/:email', (req, res) => {
    res.render('auth', {format: "confirm", email: req.params.email, mailBox: getMailboxUrl(req.params.email)});
    // add relocate to the profile if the email was verified
});

router.get('/reset-password-sent/:email', (req, res) => {
    res.render('auth', {format: 'reset-sent', email: req.params.email, mailBox: getMailboxUrl(req.params.email)});
});

router.get('/forgot', (req, res) => {res.render('auth', {format: 'forgot'});});

module.exports = router;
