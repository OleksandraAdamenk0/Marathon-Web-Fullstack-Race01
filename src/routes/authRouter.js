const express = require('express');
const emailConfirmController = require("../controllers/emailConfirmController");
const userRegistrationController = require("../controllers/userRegistrationController");
const userLoginController = require("../controllers/userLoginController");
const resetPasswordController = require("../controllers/resetPasswordController");

const router = express.Router();

router.get('/verify-email', emailConfirmController);

router.post('/registration', userRegistrationController);
router.post('/login', userLoginController);
router.post('/reset', resetPasswordController);

module.exports = router;