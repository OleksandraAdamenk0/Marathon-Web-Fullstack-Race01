const PlayersCards = require('../../models/PlayersCards');
const Room = require('../../models/Room');
const User = require('../../models/User');
const Player = require('../../models/Player');

const playersCards = new PlayersCards();
const roomModel = new Room();
const userModel = new User();
const playerModel = new Player();

module.exports = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.getById(userId);
        if (!user) return res.status(400).json({error: 'User not found'});

        const roomId = req.params.room_id;
        const room = await roomModel.getById(roomId);
        if (!room) return res.status(400).json({error: 'Room not found'});

        const player = await playerModel.getPlayerByUserAndRoom(userId, roomId);
        if (!player) return res.status(400).json({error: 'Player not found'});

        const hand = await playersCards.getHand(player.id, roomId);
        const board = await playersCards.getBoardState(roomId);

        res.status(200).json({hand: hand, boardState: board});
    } catch (error) {
        console.error('[getHandController]', error);
        res.status(500).json({error: 'Failed to fetch hand'});
    }
};