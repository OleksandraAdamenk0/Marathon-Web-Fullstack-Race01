async function logoutController(req, res) {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict'
    });
    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict'
    });
    res.redirect('/');
}

module.exports = logoutController;