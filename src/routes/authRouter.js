const express = require('express');
const emailConfirmController = require("../controllers/emailConfirmController");
const userRegistrationController = require("../controllers/userRegistrationController");
const UserLoginController = require("../controllers/UserLoginController");

const router = express.Router();

router.get('/verify-email', emailConfirmController);

router.post('/registration', userRegistrationController);
router.post('/login', UserLoginController);

module.exports = router;