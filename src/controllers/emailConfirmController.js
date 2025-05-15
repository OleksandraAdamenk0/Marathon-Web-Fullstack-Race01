const jwt = require("jsonwebtoken");
const {getUserById, verifyUserEmail} = require("../models/user");
const {generateAccessToken, generateRefreshToken, saveRefreshToken} = require("../utils/redis");
const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET_KEY || 'your_email_secret';

async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, JWT_EMAIL_SECRET);

        const user = await getUserById(decoded.id);
        if (!user) return res.status(400).json({error: "User not found"});

        await verifyUserEmail(user.id);

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
            maxAge: 604800000,
        })

        res.redirect('/profile');
    } catch (error) { res.status(400).json({error: `Invalid or expired verification token: ${error}`}); }
}

module.exports = verifyEmail;