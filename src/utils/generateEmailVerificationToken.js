const jwt = require("jsonwebtoken");

const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET_KEY || 'JWT_EMAIL_SECRET_KEY';

module.exports = function generateEmailVerificationToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_EMAIL_SECRET, { expiresIn: '1h' });
}