const express = require("express");
const authRouter = require("./authRouter");

const router = express.Router();

router.use('/auth', authRouter);  // Responsible for authentification

// other game routers here

module.exports = router;