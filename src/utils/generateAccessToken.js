const jwt = require("jsonwebtoken");

const JWT_ACCESS_EXPIRATION = '15m';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET_KEY || 'your_access_secret';

module.exports = function generateAccessToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRATION });
}