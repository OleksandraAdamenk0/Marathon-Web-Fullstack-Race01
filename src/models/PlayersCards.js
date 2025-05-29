const Model = require('./Model');

class PlayersCardsModel extends Model {
    constructor() {
        super('players_cards');
    }

    async addCard(playerId, roomId, cardId, zone, position = null, isActive = false, instanceNumber = 1) {
        const sql = `INSERT INTO players_cards (player_id, room_id, card_id, zone, position, is_active, instance_number)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        return this.query(sql, [playerId, roomId, cardId, zone, position, isActive, instanceNumber]);
    }

    async addCardDeck(playerId, roomId, cardId, position = null, instanceNumber = 1) {
        return this.addCard(playerId, roomId, cardId, 'deck', position, false, instanceNumber);
    }

    async addCardLeader(playerId, roomId, cardId, instanceNumber = 1) {
        return this.addCard(playerId, roomId, cardId, 'leader', null, false, instanceNumber);
    }

    async moveCard(playerId, roomId, cardId, instanceNumber, newZone, position = null) {
        const sql = `UPDATE players_cards
                     SET zone     = ?,
                         position = ?
                     WHERE player_id = ?
                       AND room_id = ?
                       AND card_id = ?
                       AND instance_number = ?`;
        return this.query(sql, [newZone, position, playerId, roomId, cardId, instanceNumber]);
    }

    async moveFromDeckToHand(playerId, roomId, cardId, instanceNumber, position = null) {
        return this.moveCard(playerId, roomId, cardId, instanceNumber, 'hand', position);
    }

    async moveFromHandToBoard(playerId, roomId, cardId, instanceNumber, position = null) {
        return this.moveCard(playerId, roomId, cardId, instanceNumber, 'board', position);
    }

    async moveFromHandToFarm(playerId, roomId, cardId, instanceNumber) {
        return this.moveCard(playerId, roomId, cardId, instanceNumber, 'farm');
    }

    async moveFromHandToLeader(playerId, roomId, cardId, instanceNumber) {
        return this.moveCard(playerId, roomId, cardId, instanceNumber, 'leader');
    }

    async moveFromHandToDiscard(playerId, roomId, cardId, instanceNumber) {
        return this.moveCard(playerId, roomId, cardId, instanceNumber, 'discard');
    }

    async moveFromDeckToDiscard(playerId, roomId, cardId, instanceNumber) {
        return this.moveCard(playerId, roomId, cardId, instanceNumber, 'discard');
    }

    async getAllPlayerCards(playerId, roomId) {
        const sql = `SELECT *
                     FROM players_cards
                     WHERE player_id = ?
                       AND room_id = ?
                     ORDER BY card_id, instance_number`;
        return this.query(sql, [playerId, roomId]);
    }

    async getSpecific(playerId, roomId, cardId, zone, instanceNumber = null) {
        let sql = `SELECT * FROM players_cards
                    WHERE id = ?
                    AND room_id = ?
                    AND zone = 'hand'
`;
        let params = [playerId, roomId, cardId, zone];

        if (instanceNumber !== null) {
            sql += ` AND instance_number = ?`;
            params.push(instanceNumber);
        }

        sql += ` ORDER BY instance_number ASC LIMIT 1`;

        const [res] = await this.query(sql, params);
        return res;
    }

    async getHand(playerId, roomId) {
        return await this.query(
            `SELECT pc.*, c.name, c.image_url, c.attack, c.defense, c.cost, c.card_type
             FROM players_cards pc
                      JOIN cards c ON pc.card_id = c.id
             WHERE pc.player_id = ?
               AND pc.room_id = ?
               AND pc.zone = 'hand'
             ORDER BY pc.position ASC, pc.card_id ASC, pc.instance_number ASC`,
            [playerId, roomId]
        );
    }

    async getBoardState(roomId) {
        return await this.query(
            `SELECT pc.*,
                    c.name,
                    c.image_url,
                    c.attack,
                    c.defense,
                    c.cost,
                    c.card_type,
                    p.user_id
             FROM players_cards pc
                      JOIN cards c ON pc.card_id = c.id
                      JOIN players p ON pc.player_id = p.id
             WHERE pc.room_id = ?
               AND pc.zone IN ('board', 'farm', 'leader')
             ORDER BY pc.position ASC, pc.card_id ASC, pc.instance_number ASC`,
            [roomId]
        );
    }


    async deleteAllByRoom(roomId) {
        return await this.query(
            `DELETE
             FROM players_cards
             WHERE room_id = ?`,
            [roomId]
        );
    }

    async getNextInstanceNumber(playerId, roomId, cardId) {
        const result = await this.query(
            `SELECT MAX(instance_number) as max_instance
             FROM players_cards
             WHERE player_id = ?
               AND room_id = ?
               AND card_id = ?`,
            [playerId, roomId, cardId]
        );

        return (result[0]?.max_instance || 0) + 1;
    }

    async setCurrentDefense(playerId, roomId, cardId, instanceNumber, newDef) {
        const sql = `
            UPDATE players_cards
            SET current_defense = ?
            WHERE player_id = ?
              AND room_id = ?
              AND card_id = ?
              AND instance_number = ?
        `;
        return this.query(sql, [newDef, playerId, roomId, cardId, instanceNumber]);
    }

    async updateCurrentDefense(playerId, roomId, cardId, instanceNumber, modifier) {
        const sql = `
            UPDATE players_cards
            SET current_defense = current_defense + ?
            WHERE player_id = ?
              AND room_id = ?
              AND card_id = ?
              AND instance_number = ?
        `;
        return this.query(sql, [modifier, playerId, roomId, cardId, instanceNumber]);
    }

    async resetAllDefense(roomId) {
        const sql = `
            UPDATE players_cards pc
                JOIN cards c ON pc.card_id = c.id
            SET pc.current_defense = c.defense
            WHERE pc.room_id = ?
              AND pc.zone IN ('board', 'farm', 'leader')
        `;
        return this.query(sql, [roomId]);
    }

}

module.exports = PlayersCardsModel;
