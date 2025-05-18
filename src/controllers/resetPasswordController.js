const UserModel = require('../models/User');
const sendResetEmail = require('../utils/sendResetEmail.js');

const User = new UserModel();

async function resetPasswordController(req, res) {
    const user = await User.getUserByEmail(req.body.email);
    if (!user) return res.status(400).json({error: 'User not found'});

    if (await sendResetEmail(user) === false) return res.status(500).json({error: 'Error sending reset email'});
    res.redirect(`/reset-password-sent/${user.email}`);
}

module.exports = resetPasswordController;