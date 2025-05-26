const express = require('express');
const router = express.Router();

const authenticateAccessToken = require('../middleware/authenticateAccessToken');

// Controllers
const createPublicRoomController = require('../controllers/roomControllers/createPublicRoomController');
const createPrivateRoomController = require('../controllers/roomControllers/createPrivateRoomController');
const joinRoomController = require('../controllers/roomControllers/joinRoomController');
const joinRandomRoomController = require('../controllers/roomControllers/joinRandomRoomController');
const getAvailablePublicRoomsController = require('../controllers/roomControllers/getAvailablePublicRoomsController');
const getRoomByIdController = require('../controllers/roomControllers/getRoomByIdController');

router.post('/public/create', authenticateAccessToken, createPublicRoomController);
router.post('/private/create', authenticateAccessToken,createPrivateRoomController);

router.post('/join-random', authenticateAccessToken, joinRandomRoomController);
router.get('/join/:roomId', authenticateAccessToken, joinRoomController);
router.get('/public/available', authenticateAccessToken, getAvailablePublicRoomsController);
router.get('/:roomId', authenticateAccessToken, getRoomByIdController);

module.exports = router;
