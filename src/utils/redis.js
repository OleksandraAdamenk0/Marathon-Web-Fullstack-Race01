const jwt = require('jsonwebtoken');
require("dotenv").config();


const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET_KEY || 'your_access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET_KEY || 'your_refresh_secret';
const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET_KEY || 'your_email';
const JWT_ACCESS_EXPIRATION = '15m';
const JWT_REFRESH_EXPIRATION = '7d';

function generateAccessToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRATION });
}

function generateRefreshToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
}

function generateEmailVerificationToken(user) {
    console.log("Secret when generating: ", JWT_EMAIL_SECRET);
    return jwt.sign({ id: user.id, email: user.email }, JWT_EMAIL_SECRET, { expiresIn: '1h' });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateEmailVerificationToken
};