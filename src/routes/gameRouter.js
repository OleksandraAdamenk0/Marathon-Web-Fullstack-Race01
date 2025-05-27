const express = require('express');
const router = express.Router();

const authenticateAccessToken = require('../middleware/authenticateAccessToken');

const getHandAndBoardController = require('../controllers/gameControllers/getHandAndBoardController');

router.get('/get-hand-and-board', authenticateAccessToken, getHandAndBoardController);

module.exports = router;
