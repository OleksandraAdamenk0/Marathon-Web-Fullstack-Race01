const UserModel = require("../models/User");
User = new UserModel();

async function getUserProfileController(req, res) {
     const profileUser = await User.getById(req.params.id);
  res.render('profile', {
    user: profileUser,
    currentUser: req.user
  });
}

module.exports = getUserProfileController;
