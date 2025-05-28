const Room = require('../../models/Room');
const User = require('../../models/User');

const userModel = new User();
const roomModel = new Room();

module.exports = async (req, res) => {
    try {
        const userId = req.user.id;
        if (await userModel.getById(userId) === null) return res.status(400).json({error: 'User not found'});

        const roomId = parseInt(req.params.roomId, 10);

        const joinedRoom = await roomModel.getById(roomId);
        if (!joinedRoom) {
            return res.status(400).json({error: 'Failed to find room with given id'});
        }

        if (joinedRoom.status !== 'waiting' || joinedRoom.player_two_id !== null) {
            return res.status(400).json({error: 'Room is not available'});
        }

        if (joinedRoom.code !== null) {
            const {code} = req.body;
            if (joinedRoom.code !== code) {
                return res.status(400).json({error: 'Invalid room code'});
            }
        }

        if (userId === joinedRoom.player_one_id || userId === joinedRoom.player_two_id) {
            return res.redirect(`/room/${roomId}`);
        }

        const setSecondPlayerResult = await roomModel.setSecondPlayer(joinedRoom.id, userId);
        if (setSecondPlayerResult === null) {
            return res.status(500).json({error: 'Failed to set second player'});
        }

        if (req.query.json === 'true') {
            return res.status(200).json({
                success: true,
                message: 'Joined room successfully',
                roomId,
                redirectTo: `/room/${roomId}`
            });
        }

        res.redirect(`/room/${roomId}`);

    } catch (error) {
        console.error['[JoinRoomController]', error];
        res.status(500).json({error: 'Failed to join room'});
    }
}
