const Room = require('../../models/Room');
const User = require('../../models/User');

const userModel = new User();
const roomModel = new Room();

module.exports = async (req, res) => {
    console.log('[CREATE ROOM] Controller hit!');
    try {
        const userId = req.user.id;
        const user = await userModel.getById(userId);
        if (!user) return res.status(400).json({ error: 'User not found' });

        const room = await roomModel.createPublicRoom(userId);
        if (!room) throw new Error('Failed to insert room in DB');

        if (req.query.json === 'true') {
            return res.status(200).json({
                success: true,
                message: 'Public room created',
                roomId: room.id,
                redirectTo: `/room/${room.id}`
            });
        }

        res.redirect(`/room/${room.id}`);
    } catch (error) {
        console.error('[CreatePublicRoomController]', error);
        res.status(500).send('Failed to create public room');
    }
};
