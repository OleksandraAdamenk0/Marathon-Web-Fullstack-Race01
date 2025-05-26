const Room = require('../../models/Room');
const User = require('../../models/User');

const roomModel = new Room();
const userModel = new User();

module.exports = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const room = await roomModel.getById(roomId);
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const player1 = room.player_one_id ? await userModel.getById(room.player_one_id) : null;
        const player2 = room.player_two_id ? await userModel.getById(room.player_two_id) : null;

        res.status(200).json({
            roomId: room.id,
            status: room.status,
            player1,
            player2
        });
    } catch (error) {
        console.error('[getRoomByIdController]', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
};
