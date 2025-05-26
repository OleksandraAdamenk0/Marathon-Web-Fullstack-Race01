const Room = require('../../models/Room');
const User = require('../../models/User');

const roomModel = new Room();
const userModel = new User();

module.exports = async (req, res) => {
    console.log('[joinRandomRoomController] starting');

    try {
        const userId = req.user.id;
        if (await userModel.getById(userId) === null) return res.status(400).json({error: 'User not found'});
        const room = await roomModel.getNextAvailableRoom();
        if (!room) {
            return res.status(404).json({ error: 'No available rooms found' });
        }
        const redirectUrl = `/api/room/join/${room.id}`;
        if (req.query.json === 'true') {
            return res.status(200).json({
                success: true,
                message: 'Redirecting to join available room',
                roomId: room.id,
                redirectTo: redirectUrl
            });
        }
        res.redirect(redirectUrl);
    } catch (err) {
        console.error('[JoinRandomRoomController]', err);
        res.status(500).json({ error: 'Failed to find and join a random room' });
    }
}
