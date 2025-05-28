async function createPrivateGameController(req, res) {
 res.render("room", {format: "private-room"});
}

module.exports = createPrivateGameController;