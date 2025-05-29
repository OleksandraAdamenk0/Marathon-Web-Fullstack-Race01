const express = require('express');
const logoutController = require("../controllers/logoutController");
const authenticateAccessToken = require("../middleware/authenticateAccessToken");
const getUserProfileController = require("../controllers/getUserProfileController");

const router = express.Router();

router.get('/', authenticateAccessToken, (req, res) => {
    if (req.user.id) res.redirect(`/profile/${req.user.id}`)
    else res.redirect('/login');
})

router.get('/:id', authenticateAccessToken, getUserProfileController);


router.post('/:id/logout', logoutController);

module.exports = router;