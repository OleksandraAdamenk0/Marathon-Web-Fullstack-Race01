const express = require('express');
const regularRouter = require("./openRouter");
const apiRouter = require("./apiRouter");
const roomRouter = require("./roomRouter");

const router = express.Router();

router.use('/', regularRouter);
router.use('/api', apiRouter);

module.exports = router;


