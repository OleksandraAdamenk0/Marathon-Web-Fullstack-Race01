import Model from "./Model";

class Room extends Model {
    constructor() {
        super('rooms');
    }

    async createPublicRoom(userId) {
        const result = await this.query("INSERT INTO rooms (player_one_id) VALUES (?);", [userId]);
        return  await this.getById(result.insertId);
    }

    async createPrivateRoom(userId) {
        const result = await this.query("INSERT INTO rooms (player_one_id) VALUES (?);", [userId]);
        const room = await this.getById(result.insertId);
        if (!room) return null;
        const code = String(room.id).padStart(5, '0');
        await this.query("UPDATE rooms SET code = ? WHERE id = ?", [code, room.id]);
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
        return await this.query("SELECT * FROM rooms WHERE code = NULL and status = 'waiting'");
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

}

