const ImageModel = require('../models/Image');
const imageModel = new ImageModel();
const UserModel = require('../models/User');
const userModel = new UserModel();

// POST /api/images/avatar
async function uploadAvatarController(req, res) {
    try {
        const userId = req.user.id;
        const user = await userModel.getById(userId);
        if (!user) return res.status(400).json({ error: 'User not found' });

        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const avatarPath = await imageModel.saveAvatar(req.file, userId);
        res.status(200).json({ message: 'Avatar uploaded successfully', path: avatarPath });
    } catch (err) {
        console.error('[Upload Avatar Error]', err);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
}

// DELETE /api/images/avatar
async function deleteAvatarController(req, res) {
    try {
        const userId = req.user.id;
        const user = await userModel.getById(userId);
        if (!user) return res.status(400).json({ error: 'User not found' });

        await imageModel.deleteAvatar(userId);
        res.status(200).json({ message: 'Avatar deleted successfully' });
    } catch (err) {
        console.error('[Delete Avatar Error]', err);
        res.status(500).json({ error: 'Failed to delete avatar' });
    }
}

// DELETE /api/images/avatar/:userId for instance for admins
async function deleteAnyAvatarController(req, res) {
    try {
        const userId = req.params.userId;
        const user = await userModel.getById(userId);
        if (!user) return res.status(400).json({ error: 'User not found' });
        if (user.status !== 'admin') return res.status(400).json({ error: 'User is not allowed to delete avatar' });
        await imageModel.deleteAvatar(userId);
        res.status(200).json({ message: 'Avatar deleted successfully' });
    } catch (err) {
        console.error('[Delete Avatar Error]', err);
        res.status(500).json({ error: 'Failed to delete avatar' });
    }
}

async function resetAvatarToDefaultController(req, res) {
    try {
        const userId = req.user.id;
        const user = await userModel.getById(userId);
        if (!user) return res.status(400).json({ error: 'User not found' });

        await imageModel.deleteAvatar(userId);
        await userModel.setAvatar(userId, '/avatar.png');

        res.status(200).json({ message: 'Avatar reset to default' });
    } catch (err) {
        console.error('[Reset Avatar Error]', err);
        res.status(500).json({ error: 'Failed to reset avatar' });
    }
}

module.exports = {
    uploadAvatarController,
    deleteAvatarController,
    deleteAnyAvatarController,
    resetAvatarToDefaultController
};
