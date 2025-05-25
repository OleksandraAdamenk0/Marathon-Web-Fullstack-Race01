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

    async getSpecific(playerId, roomId, cardId, zone) {
        const [res] = await this.query(
            `SELECT * FROM players_cards WHERE player_id = ? AND room_id = ? AND card_id = ? AND zone = ?`,
            [playerId, roomId, cardId, zone]
        );
        return res;
    }

    async getHand(playerId, roomId) {
        return await this.query(
            `SELECT pc.*, c.name, c.image_url, c.attack, c.defense, c.cost, c.card_type
             FROM players_cards pc
             JOIN cards c ON pc.card_id = c.id
             WHERE pc.player_id = ? AND pc.room_id = ? AND pc.zone = 'hand'
             ORDER BY pc.position ASC`,
            [playerId, roomId]
        );
    }

    async getBoardState(roomId) {
        return await this.query(
            `SELECT pc.*, c.name, c.image_url, c.attack, c.defense, c.cost, c.card_type, p.user_id
             FROM players_cards pc
             JOIN cards c ON pc.card_id = c.id
             JOIN players p ON pc.player_id = p.id
             WHERE pc.room_id = ? AND pc.zone IN ('board', 'farm', 'leader')
             ORDER BY pc.position ASC`,
            [roomId]
        );
    }

    async deleteAllByRoom(roomId) {
        return await this.query(
            `DELETE FROM players_cards WHERE room_id = ?`,
            [roomId]
        );
    }
}

module.exports = PlayersCardsModel;
