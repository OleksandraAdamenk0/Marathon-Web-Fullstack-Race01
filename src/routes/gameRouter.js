const express = require('express');
const createPrivateGameController = require("../controllers/createPrivateGameController");
const joinPrivateGameController = require("../controllers/joinPrivateGameController");
const publicGameController = require("../controllers/publicGameController");
const getGameController = require("../controllers/getGameController");

const router = express.Router();

router.get('/public/:playerId/:roomId', getGameController);
router.get('/private/:id', joinPrivateGameController);

router.post('/private/:id', createPrivateGameController);
router.post('/public/:id', publicGameController);


module.exports = router;