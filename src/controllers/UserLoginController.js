const {getUserByEmail, comparePassword} = require("../models/user");
const {generateAccessToken, generateRefreshToken} = require("../utils/redis");

async function UserLoginController(req, res) {
    const { email, password } = req.body;

    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({error: 'User not found'});
        }

        const passwordMatch = comparePassword(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({error: 'Invalid password'});
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect('/api/profile')
    } catch (err) {
        console.error("Login error: ", err);
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = UserLoginController;