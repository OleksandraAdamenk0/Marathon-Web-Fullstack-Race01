const UserModel = require("../models/User");
const RoomModel = require("../models/Room");

const userModel = new UserModel();
const roomModel = new RoomModel();

module.exports = async function getMenuController(req, res) {
  try {
    const user = await userModel.getById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    const rooms = await roomModel.getAll();
    res.render('menu', { user, rooms });
  } catch (err) {
    console.error('[getMenuController]', err);
    res.status(500).send('Error loading menu page');
  }
};

