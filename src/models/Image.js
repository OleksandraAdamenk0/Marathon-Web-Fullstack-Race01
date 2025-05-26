const fs = require('fs');
const path = require('path');
const util = require('util');
const UserModel = require('./User');

const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);

class Image {
    constructor() {
        this.avatarsUploadsPath = path.join(__dirname, '../../public/uploads/avatars/');
        this.userModel = new UserModel();
    }

    async saveAvatar(file, userId) {
        const user = await this.userModel.getById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const fileExt = path.extname(file.originalname);
        const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];
        if (!allowedExts.includes(fileExt.toLowerCase())) {
            throw new Error('Unsupported image format');
        }

        const fileName = `avatar${userId}${fileExt}`;
        const destPath = path.join(this.avatarsUploadsPath, fileName);

        try {
            await rename(file.path, destPath);
            const dbPath = `uploads/avatars/${fileName}`;
            await this.userModel.setAvatar(userId,dbPath);
            return dbPath;
        } catch (err) {
            console.error('Failed to save avatar:', err);
            throw err;
        }
    }

    async deleteAvatar(userId) {
        const user = await this.userModel.getById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const currentExt = path.extname(user.avatar_url || '.png');
        const avatarPath = path.join(this.avatarsUploadsPath, `avatar${userId}${currentExt}`);

        try {
            await unlink(avatarPath);
        } catch (err) {
            console.warn('Avatar not found or already deleted');
        }
    }
}

module.exports = Image;
