const Model = require('./Model');

class Room extends Model {
    constructor() {
        super('rooms');
    }

    async createPublicRoom(userId) {
        const result = await this.query("INSERT INTO rooms (player_one_id) VALUES (?);", [userId]);
        return  await this.getById(result.insertId);
    }

    async createPrivateRoom(userId, code) {
        const result = await this.query(
            "INSERT INTO rooms (player_one_id, code) VALUES (?, ?);",
            [userId, code]
        );
        return await this.getById(result.insertId);
    }

    async getRoomCode(id) {
        const room = await this.getById(id);
        if (!room) return null;
        return room.code;
    }

    async getRoomByCode(code) {
        const rooms = this.query("SELECT * FROM rooms WHERE code = ?", [code]);
        if (rooms.length === 0) return null;
        return rooms[0];
    }

    async getAvailablePublicRooms() {
        return await this.query(`
		SELECT * FROM rooms 
		WHERE code IS NULL 
		AND status = 'waiting'
        AND player_two_id IS NULL
    `	);
    }

    async getNextAvailableRoom() {
        console.log('[RoomModel] Finding next available room...');

        const [rooms] = await this.query(
            `SELECT * FROM ${this.table} 
         WHERE status = 'waiting' 
         AND player_two_id IS NULL 
         AND code IS NULL 
         LIMIT 1;`
        );
        return rooms || null;
    }

    async setFirstPlayer(roomId, userId) {
        return await this.query("UPDATE rooms SET player_one_id = ? WHERE id = ?", [userId, roomId]);
    }

    async setSecondPlayer(roomId, userId) {
        return await this.query("UPDATE rooms SET player_two_id = ? WHERE id = ?", [userId, roomId]);
    }

    async setWinner(roomId, userId) {
        return await this.query("UPDATE rooms SET winner_id = ? WHERE id = ?", [userId, roomId]);
    }

    async setInprogressStatus(id) {
        return await this.query("UPDATE rooms SET status = 'in_progress' WHERE id = ?", [id]);
    }

    async setFinishedStatus(id) {
        return await this.query("UPDATE rooms SET status = 'finished' WHERE id = ?", [id]);
    }

    async getTurnPlayer(roomId) {
        const result = await this.query("SELECT current_turn_player_id FROM rooms WHERE id = ?", [roomId]);
        return result[0] || null;
    }

    async getTurnNumber(roomId) {
        const result = await this.query("SELECT turn_number FROM rooms WHERE id = ?", [roomId]);
        return result[0] || null;
    }

    async incrementTurn(roomId) {
        return this.query(
            "UPDATE rooms SET turn_number = turn_number + 1 WHERE id = ?",
            [roomId]
        );
    }

    async setTurnPlayer(roomId, playerId) {
        return this.query(
            "UPDATE rooms SET current_turn_player_id = ? WHERE id = ?",
            [playerId, roomId]
        );
    }

    async updateRoomStatus(roomId, status) {
        return this.query(
            "UPDATE rooms SET status = ? WHERE id = ?",
            [status, roomId]
        );
    }

    async initializeGameTurn(roomId) {
        try {
            const players = await this.query(`
                SELECT p.id, p.user_id, p.role 
                FROM players p 
                WHERE p.room_id = ?
            `, [roomId]);

            if (players.length !== 2) {
                throw new Error('Cannot initialize turn: need exactly 2 players');
            }

            const firstPlayerIndex = Math.floor(Math.random() * 2);
            const firstPlayer = players[firstPlayerIndex];

            await this.setTurnPlayer(roomId, firstPlayer.user_id);
            await this.updateRoomStatus(roomId, 'in-progress');

            console.log(`[Room Model] Game initialized: ${firstPlayer.role} (user ${firstPlayer.user_id}) goes first in room ${roomId}`);

            return {
                currentTurnUserId: firstPlayer.user_id,
                players: players
            };
        } catch (error) {
            console.error('[Room Model] Error initializing game turn:', error);
            throw error;
        }
    }

    async getRoomWithPlayers(roomId) {
        try {
            const sql = `
                SELECT 
                    r.*,
                    p1.id as player1_id, p1.user_id as player1_user_id, p1.role as player1_role,
                    p2.id as player2_id, p2.user_id as player2_user_id, p2.role as player2_role,
                    u1.username as player1_username,
                    u2.username as player2_username
                FROM rooms r
                LEFT JOIN players p1 ON r.player_one_id = p1.user_id AND p1.room_id = r.id
                LEFT JOIN players p2 ON r.player_two_id = p2.user_id AND p2.room_id = r.id
                LEFT JOIN users u1 ON p1.user_id = u1.id
                LEFT JOIN users u2 ON p2.user_id = u2.id
                WHERE r.id = ?
            `;

            const result = await this.query(sql, [roomId]);
            return result[0] || null;
        } catch (error) {
            console.error('[Room Model] Error getting room with players:', error);
            throw error;
        }
    }

    async areBothPlayersReady(roomId) {
        try {
            const result = await this.query(`
                SELECT COUNT(DISTINCT p.user_id) as ready_players
                FROM players p
                JOIN players_cards pc ON p.id = pc.player_id
                WHERE p.room_id = ? AND pc.zone = 'hand'
                GROUP BY p.room_id
                HAVING COUNT(DISTINCT p.user_id) = 2
            `, [roomId]);

            return result.length > 0;
        } catch (error) {
            console.error('[Room Model] Error checking if players are ready:', error);
            return false;
        }
    }
}

module.exports = Room;
