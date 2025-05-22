const UserModel = require('../models/User');
const User = new UserModel();

// GET /api/users/:id
async function getUserByIdController(req, res) {
    try {
        const user = await User.getById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

// GET /api/users/by-username/:username
async function getUserByUsernameController(req, res) {
    try {
        const user = await User.getUserByUsername(req.params.username);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Error fetching user by username:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    getUserByIdController,
    getUserByUsernameController
};
