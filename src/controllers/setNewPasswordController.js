const jwt = require("jsonwebtoken");
const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET_KEY || 'your_email_secret';
const UserModel = require("../models/User");

const User = new UserModel();

async function setNewPasswordController(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, JWT_EMAIL_SECRET);
        const user = await User.getById(decoded.id);
        if (!user) return res.status(400).json({error: "User not found"});
        res.render('auth', {format: "new-password-form", email: user.email})
    } catch (error) {
        res.status(400).json({error: `Invalid or expired verification token: ${error}`});
    }
}

module.exports = setNewPasswordController;