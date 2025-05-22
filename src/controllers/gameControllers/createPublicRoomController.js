const Room = require('../../models/Room');
const User = require('../../models/User');

const userModel = new User();
const roomModel = new Room();

module.exports = async (req, res) => {
    try {
        const userId = req.user.id;
        if (await userModel.getById(userId) === null) return res.status(400).json({error: 'User not found'});

        const room = await roomModel.createPublicRoom(userId);
        if (room === null) throw new Error('Failed to insert room in DB');

        res.status(200).json({
            message: 'Public room created',
            roomData: room
        });
    } catch (error) {
        console.error['[CreatePublicRoomController]', error];
        res.status(500).json({error: 'Failed to create public room'});
    }
};