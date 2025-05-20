const express = require('express');
const logoutController = require("../controllers/logoutController");

const router = express.Router();

router.post('/:id/logout', logoutController);

module.exports = router;