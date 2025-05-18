const UserModel = require('../models/User');
const sendVerificationEmail = require('../utils/sendVerificationEmail.js');

const User = new UserModel();

module.exports = async function userRegistrationController(req, res) {
    const { username, email, password } = req.body;

    try {
        if (await User.getUserByUsername(username))
            return res.status(400).json({field: username, message: 'Username already in use'});
        if (await User.getUserByEmail(email))
            return res.status(400).json({field: email, message: 'Email already in use'});

        const newUser = await User.createUser(email, username, password);
        if (!newUser) return res.status(500).json({error: 'Error creating user'});
        await sendVerificationEmail(newUser);

        res.redirect(`/verify-email/${email}`);
    } catch (error) {
        console.log("Error during registration: ", error);
        res.status(500).json({error: error});
    }
}