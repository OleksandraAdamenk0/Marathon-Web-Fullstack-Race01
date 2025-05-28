const Room = require('../../models/Room');
const User = require('../../models/User');

const userModel = new User();
const roomModel = new Room();

module.exports = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;

        if (!code) return res.status(400).json({ error: 'Missing room code' });

        const user = await userModel.getById(userId);
        if (!user) return res.status(400).json({ error: 'User not found' });

        const room = await roomModel.createPrivateRoom(userId, code);
        if (!room) throw new Error('Failed to insert private room in DB');

        if (req.query.json === 'true') {
            return res.status(200).json({
                success: true,
                message: 'Private room created',
                roomId: room.id,
                redirectTo: `/room/${room.id}`,
                code: room.code
            });
        }

        res.redirect(`/room/${room.id}`);
    } catch (error) {
        console.error('[CreatePrivateRoomController]', error);
        res.status(500).send('Failed to create private room');
    }
};

