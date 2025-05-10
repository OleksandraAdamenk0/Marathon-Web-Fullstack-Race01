const express = require('express');
const verifyEmail = require("../controllers/emailConfirm");
const userRegistrationController = require("../controllers/userRegistrationController");
const UserLoginController = require("../controllers/UserLoginController");

const router = express.Router();

router.get('/verify-email', verifyEmail);

router.post('/registration', userRegistrationController);
router.post('/login', UserLoginController);

module.exports = router;