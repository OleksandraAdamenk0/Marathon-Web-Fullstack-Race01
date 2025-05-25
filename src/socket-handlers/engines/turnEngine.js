const PlayersCards = require('../../models/PlayersCards');
const Player = require('../../models/Player');
const Card = require('../../models/Card');
const Room = require('../../models/Room');

const playersCards = new PlayersCards();
const playerModel = new Player();
const cardModel = new Card();
const roomModel = new Room();

class TurnEngine {
    static async playCard({roomId, userId, cardId, destination}) {

        const whosTurn = await roomModel.getTurn(roomId);
        if (whosTurn !== userId) return {ok: false, reason: 'Not your turn'};

        const room = await roomModel.getById(roomId);
        if (!room) return {ok: false, reason: 'Room not found'};

        const player = await playerModel.getPlayersByRoomId(userId, roomId);
        const card = await cardModel.getById(cardId);

        const pc = await playersCards.getSpecific(player.id, roomId, cardId, 'hand'); //todo
        if (!pc) return {ok: false, reason: 'Card not in hand'};

        if (player.energy < card.cost) return {ok: false, reason: 'Not enough energy'};

        // TODO: write destination-specific validators

        await playersCards.moveCard(player.id, roomId, cardId, destination);
        await playerModel.updateEnergy(player.id, -card.cost);

        const hand = await playersCards.getHand(player.id, roomId);
        const board = await playersCards.getBoardState(roomId);

        return {ok: true, hand, boardState: board};
    }
}

module.exports = TurnEngine;
