async function publicGameController(req, res) {
    res.render('room', {format: 'public-room'});
}

module.exports = publicGameController;