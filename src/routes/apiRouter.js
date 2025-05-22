const express = require("express");
const authRouter = require("./authRouter");
const profileRouter = require("./profileRouter");
const gameRouter = require("./gameRouter");
const roomRouter = require("./roomRouter");

const router = express.Router();

router.use('/auth', authRouter);  // Responsible for authentification
router.use('/profile', profileRouter);
router.use('room', roomRouter);
router.use('/game', gameRouter);

// other game routers here

module.exports = router;