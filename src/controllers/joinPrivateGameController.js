async function JoinPrivateGameController(req, res) {
    res.render('room', {format: 'code-form'});
}

module.exports = JoinPrivateGameController;
