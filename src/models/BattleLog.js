import Model from "./Model";

class BattleLog extends Model {
    constructor() {
        super("battle_logs");
    }

    async writeLog(userId, roomId, log) {
        return await this.query("INSERT INTO battle_logs(room_id, user_id, action)  VALUES(?, ?, ?)", [roomId, userId, log]);
    }

    async getLogsByRoom(roomId) {
        return await this.query("SELECT * FROM battle_logs WHERE room_id = ?", [roomId]);
    }

    async getLogsByUser(userId) {
        return await this.query("SELECT * FROM battle_logs WHERE user_id = ?", [userId]);
    }
}

module.exports = BattleLog;