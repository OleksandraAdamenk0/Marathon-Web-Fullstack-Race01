const express = require('express');
const router = express.Router();

const authenticateAccessToken = require('../middleware/authenticateAccessToken');

// Controllers
const createPublicRoomController = require('../controllers/roomControllers/createPublicRoomController');
const createPrivateRoomController = require('../controllers/roomControllers/createPrivateRoomController');
const joinRoomController = require('../controllers/roomControllers/joinRoomController');
const getAvailablePublicRoomsController = require('../controllers/roomControllers/getAvailablePublicRoomsController');

router.post('/public/create', authenticateAccessToken, createPublicRoomController);
router.post('/private/create', authenticateAccessToken,createPrivateRoomController);

router.post('/join/:roomId', authenticateAccessToken, joinRoomController);

router.get('/public/available', authenticateAccessToken, getAvailablePublicRoomsController);

module.exports = router;
