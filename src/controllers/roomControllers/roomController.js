const roomModel = require('../../models/Room');
const Room  = new roomModel();
const userModel = require('../../models/User');
const User = new userModel();

module.exports = async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.user.id;
    const user = await User.getById(userId);
    if (!user) return res.status(404).send('User not found');

    const room = await Room.getById(roomId);
    if (!room) return res.status(404).send('Room not found');
    if (room.status !== 'waiting') return res.status(400).send('Room is not available');
    let format = 'public';
    if (room.code !== null) format = 'private';

    const isPlayer = room.player_one_id === userId || room.player_two_id === userId;
    if (!isPlayer) return res.status(403).send('You are not part of this room');
    const opponentId = room.player_one_id === userId ? room.player_two_id : room.player_one_id;
    const opponent = await User.getById(opponentId);

    res.render('room', {
        format: format,
        room: room,
        player: user,
        opponent: opponent,
    });
};
