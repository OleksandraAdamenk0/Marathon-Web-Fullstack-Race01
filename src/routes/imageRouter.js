const express = require('express');
const multer = require('multer');
const path = require('path');
const authenticateAccessToken = require('../middleware/authenticateAccessToken');
const {
    uploadAvatarController,
    deleteAvatarController,
    deleteAnyAvatarController,
    resetAvatarToDefaultController
} = require('../controllers/imageController');

const router = express.Router();

const upload = multer({
    dest: path.join(__dirname, '../../temp')
});

router.post('/avatar', authenticateAccessToken, upload.single('avatar'), uploadAvatarController);
router.put('/avatar/reset', authenticateAccessToken, resetAvatarToDefaultController);
router.delete('/avatar', authenticateAccessToken, deleteAvatarController);
// Delete avatar of any user (admin usage)
router.delete('/avatar/:userId', authenticateAccessToken, deleteAnyAvatarController);

module.exports = router;
