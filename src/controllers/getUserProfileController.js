const UserModel = require("../models/User");
User = new UserModel();

async function getUserProfileController(req, res) {
    const user = await User.getById(req.params.id);
    res.render('profile', {user: user});
}

module.exports = getUserProfileController;