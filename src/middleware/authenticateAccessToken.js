const jwt = require('jsonwebtoken');
const {generateAccessToken} = require("../utils/redis");

require("dotenv").config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET_KEY || 'your_access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET_KEY || 'your_refresh_secret';

function authenticateAccessToken(req, res, next) {
    const token = req.cookies.access_token;
    if (!token) {
        console.log('No access token provided');
        return res.redirect('/login');
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
            const refreshToken = req.cookies.refresh_token;
            if (!refreshToken) {
                console.log('No refresh token provided');
                return res.redirect('/login');
            }

            jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
                if (err) {
                    console.log('wrong refresh token provided');
                    return res.redirect('/login');
                }

                const user = { id: decoded.id, email: decoded.email };

                const newAccessToken = generateAccessToken(user);
                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 3600000
                });

                req.user = user;
                return next();
            });
        }

        console.log(decoded);
        req.user = {id: decoded.id, email: decoded.email};
        console.log("decoded: ", decoded);
        next();
    });
}

module.exports = authenticateAccessToken;