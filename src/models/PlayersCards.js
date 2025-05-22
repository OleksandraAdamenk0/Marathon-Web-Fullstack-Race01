const Model = require('./Model');

class PlayersCardsModel extends Model {
    constructor() {
        super('players_cards');
    }

    async addCard(playerId, roomId, cardId, zone, position = null, isActive = false) {
        const sql = `INSERT INTO players_cards (player_id, room_id, card_id, zone, position, is_active) VALUES (?, ?, ?, ?, ?, ?)`;
        return this.query(sql, [playerId, roomId, cardId, zone, position, isActive]);
    }

    async addCardDeck(playerId, roomId, cardId, position = null) {
        return this.addCard(playerId, roomId, cardId, 'deck', position);
    }

    async addCardLeader(playerId, roomId, cardId) {
        return this.addCard(playerId, roomId, cardId, 'leader');
    }

    async moveCard(playerId, roomId, cardId, newZone, position = null) {
        const sql = `UPDATE players_cards SET zone = ?, position = ? WHERE player_id = ? AND room_id = ? AND card_id = ?`;
        return this.query(sql, [newZone, position, playerId, roomId, cardId]);
    }

    async moveFromDeckToHand(playerId, roomId, cardId, position = null) {
        return this.moveCard(playerId, roomId, cardId, 'hand', position);
    }

    async moveFromHandToBoard(playerId, roomId, cardId, position = null) {
        return this.moveCard(playerId, roomId, cardId, 'board', position);
    }

    async moveFromHandToFarm(playerId, roomId, cardId) {
        return this.moveCard(playerId, roomId, cardId, 'farm');
    }

    async moveFromHandToLeader(playerId, roomId, cardId) {
        return this.moveCard(playerId, roomId, cardId, 'leader');
    }

    async moveFromHandToDiscard(playerId, roomId, cardId) {
        return this.moveCard(playerId, roomId, cardId, 'discard');
    }

    async moveFromDeckToDiscard(playerId, roomId, cardId) {
        return this.moveCard(playerId, roomId, cardId, 'discard');
    }

    async getAllPlayerCards(playerId, roomId) {
        const sql = `SELECT * FROM players_cards WHERE player_id = ? AND room_id = ?`;
        return this.query(sql, [playerId, roomId]);
    }
}

module.exports = PlayersCardsModel;
