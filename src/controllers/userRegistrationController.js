const nodemailer = require('nodemailer');
const {generateEmailVerificationToken} = require('../utils/redis');
const {getUserByEmail, createUser} = require("../models/user");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
    }
})

async function sendVerificationEmail(user) {
    const token = generateEmailVerificationToken(user);
    console.log("sending token: ", token);
    const verificationLink = `http://localhost:${process.env.PORT || 5000}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: user.email,
        subject: 'Email Confirmation',
        text: `Please confirm your email by clicking on the following link: ${verificationLink}`,
    }

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log("Error sending email: ", error);
    }
}

function getMailboxUrl(email) {
    let domain = email.split('@')[1].toLowerCase();
    const urls = {
        "gmail.com": "https://mail.google.com/mail/u/0/#inbox",
        "yahoo.com": "https://mail.yahoo.com",
        "outlook.com": "https://outlook.live.com/mail/inbox",
        "hotmail.com": "https://outlook.live.com/mail/inbox",
        "icloud.com": "https://www.icloud.com/mail",
        "zoho.com": "https://mail.zoho.com"
    };
    return urls[domain] || "#";
}

async function userRegistrationController(req, res) {
    const { email, username, password, repeatPassword } = req.body;
    console.log(req.body);

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({message: 'Email already in use'});
        }

        const newUser = await createUser(email, username, password);

        await sendVerificationEmail(newUser);

        res.render('auth', {format: "confirm", email: email, mailBox: getMailboxUrl(email)});
    } catch (error) {
        console.log("Error during registration: ", error);
        res.status(500).json({error: error});
    }
}

module.exports = userRegistrationController;