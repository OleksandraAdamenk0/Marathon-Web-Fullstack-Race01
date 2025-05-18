const express = require('express');
const emailConfirmController = require("../controllers/emailConfirmController");
const userRegistrationController = require("../controllers/userRegistrationController");
const userLoginController = require("../controllers/userLoginController");
const resetPasswordController = require("../controllers/resetPasswordController");
const setNewPasswordController = require("../controllers/setNewPasswordController");
const writeNewPasswordController = require("../controllers/writeNewPasswordController");

const router = express.Router();

router.get('/verify-email', emailConfirmController);
router.get('/set-new-password', setNewPasswordController);

router.post('/registration', userRegistrationController);
router.post('/login', userLoginController);
router.post('/reset', resetPasswordController);
router.post('/set-new-password', writeNewPasswordController);

module.exports = router;