const generateEmailVerificationToken = require("./generateEmailVerificationToken.js");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
    }
})

module.exports = async function sendVerificationEmail(user) {
    const token = generateEmailVerificationToken(user);
    const verificationLink = `http://localhost:${process.env.PORT || 5000}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: user.email,
        subject: 'Email Confirmation',
        html: `
    <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        padding: 40px;
        text-align: center;
        border-radius: 10px;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    ">
        <h1 style="color: #111827;">Welcome to Our Cardgame!</h1>
        <p style="font-size: 18px; color: #374151;">Hi <b>${user.name || 'there'}</b>,</p>
        <p style="font-size: 16px; color: #4b5563;">
            Please confirm your email address by clicking the button below:
        </p>
        <a href="${verificationLink}" 
           style="
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
           ">
            Confirm Email
        </a>
        <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
            If you didn't request this, you can ignore this email.
        </p>
    </div>
  `,
    }

    try { await transporter.sendMail(mailOptions); }
    catch (error) { console.log("Error sending email: ", error); }
}