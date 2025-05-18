const UserModel = require("../models/User");

const User = new UserModel();

async function writeNewPasswordController(req, res) {
    console.log("test")

    const { password, hiddenEmail } = req.body;

    const user = await User.getUserByEmail(hiddenEmail);
    console.log("test")
    if (!await User.setPassword(user.id, password)) return res.status(500).json({error: 'Error setting new password'});
    res.redirect('/login');
}

module.exports = writeNewPasswordController;