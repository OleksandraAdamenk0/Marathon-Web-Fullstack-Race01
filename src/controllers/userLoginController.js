const UserModel = require("../models/User");
const sendVerificationEmail = require("../utils/sendVerificationEmail.js");
const generateAccessToken = require("../utils/generateAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");

const User = new UserModel();

async function UserLoginController(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.getUserByEmail(email);
        if (!user) { return res.status(400).json({error: 'User not found'}); }

        const passwordMatch = await User.comparePassword(password, user.id);
        if (!passwordMatch) return res.status(400).json({error: 'Invalid password'});

        if (!await User.isEmailVerified(user.id)) {
            console.log("test")
            await sendVerificationEmail(user);
            return res.redirect(`/verify-email/${email}`);
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

        res.redirect(`/menu`);
    } catch (err) {
        console.error("Login error: ", err);
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = UserLoginController;
