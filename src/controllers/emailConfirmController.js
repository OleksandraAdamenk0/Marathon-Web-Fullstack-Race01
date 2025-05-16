const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const generateRefreshToken = require("../utils/generateRefreshToken");
const generateAccessToken = require("../utils/generateAccessToken");
const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET_KEY || 'your_email_secret';

const User = new UserModel();

async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, JWT_EMAIL_SECRET);

        const user = await User.getById(decoded.id);
        if (!user) return res.status(400).json({error: "User not found"});

        await User.verifyUserEmail(user.id);

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
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const decoded = jwt.decode(token);
            if (decoded?.id) {
                await User.deleteById(decoded.id);
            }
            return res.redirect('/registration');
        }
        res.status(400).json({error: `Invalid or expired verification token: ${error}`});
    }
}

module.exports = verifyEmail;