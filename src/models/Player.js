const Model = require("./Model");
const crypto = require("crypto");

class Player extends Model {
    constructor() {
        super("players");
    }

    async createPlayer(userId, roomId, role) {
        return this.query(
            `INSERT INTO players (user_id, room_id, role) VALUES (?, ?, ?);`,
            [userId, roomId, role]
        );
    }

    async getPlayerByUserAndRoom(userId, roomId) {
        const result = await this.query(
            `SELECT * FROM players WHERE user_id = ? AND room_id = ? LIMIT 1;`,
            [userId, roomId]
        );
        return result[0] || null;
    }

    async getPlayersByRoomId(roomId) {
        return this.query(
            `SELECT * FROM players WHERE room_id = ?;`,
            [roomId]
        );
    }
    async getPlayersByUserId(userId) {
        return this.query(
            `SELECT * FROM players WHERE user_id = ?;`,
            [userId]
        );
    }
    async getPlayerByRole(roomId, role) {
	    const result = await this.query(
		`SELECT * FROM players WHERE room_id = ? AND role = ? LIMIT 1;`,
		[roomId, role]
	    );
	    return result[0] || null;
    }

	async getOpponent(roomId, userId) {
	    const result = await this.query(
		`SELECT * FROM players WHERE room_id = ? AND user_id != ? LIMIT 1;`,
		[roomId, userId]
	    );
	    return result[0] || null;
	}


    async areBothPlayersAssigned(roomId) {
        const players = await this.getPlayersByRoomId(roomId);
        return players.length === 2 && players.every(p => p.role);
    }

    async defineRole(roomId, userId, roomModel) {
        const room = await roomModel.getById(roomId);
        if (!room) throw new Error("Room not found");

        const opponentId =
            room.player_one_id === userId ? room.player_two_id : room.player_one_id;

        const opponentPlayer = await this.getPlayerByUserAndRoom(opponentId, roomId);

        if (!opponentPlayer) {
            // assign role randomly
            const random = crypto.randomInt(0, 2);
            const role = random === 0 ? "survivor" : "infected";
            await this.createPlayer(userId, roomId, role);
            return role;
        } else {
            // assign opposite role
            const role = opponentPlayer.role === "survivor" ? "infected" : "survivor";
            await this.createPlayer(userId, roomId, role);
            return role;
        }
    }

    async updateEnergyByPlayerId(playerId, energy) {
        return this.query(
            `UPDATE players SET energy = energy + ? WHERE id = ?;`,
            [energy, playerId]
        );
    }
}

module.exports = Player;
