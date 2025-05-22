const express = require('express');
const {
    getUserByIdController,
    getUserByUsernameController
} = require('../controllers/usersController');

const router = express.Router();

router.get('/:id', getUserByIdController);
router.get('/by-username/:username', getUserByUsernameController);

module.exports = router;
