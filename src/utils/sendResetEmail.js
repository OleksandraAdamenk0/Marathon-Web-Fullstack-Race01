const generateResetPasswordToken = require("./generateResetPasswordToken.js");
const transport = require("./createNodemailerTransport.js");

module.exports = async function sendVerificationEmail(user) {
    const token = generateResetPasswordToken(user);
    const verificationLink = `http://localhost:${process.env.PORT || 5000}/api/auth/set-new-password?token=${token}`;

    const mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: user.email,
        subject: 'Password recovery',
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
        <h1 style="color: #111827;">Lost Your Keycard, Survivor?</h1>
        <p style="font-size: 18px; color: #374151;">Hey <b>${user.name || 'stranger'}</b>,</p>
        <p style="font-size: 16px; color: #4b5563;">
            You requested to reset your password. Click the button below to restore access to your bunker terminal.
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
            Reset Password
        </a>
        <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
            If you didn't request this, someone may have guessed your name in the wasteland. You can safely ignore this email.
        </p>
    </div>
  `,
    }

    try {
        await transport.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.log("Error sending restore password email: ", error);
        return false;
    }
}