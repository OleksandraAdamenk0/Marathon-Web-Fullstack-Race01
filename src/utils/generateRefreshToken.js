const jwt = require("jsonwebtoken");

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET_KEY || 'your_refresh_secret';
const JWT_REFRESH_EXPIRATION = '7d';


module.exports = function generateRefreshToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
}