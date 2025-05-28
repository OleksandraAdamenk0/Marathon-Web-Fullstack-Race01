const Model = require('./Model');

class BattleLog extends Model {
    constructor() {
        super("battle_logs");
    }

    async writeLog(userId, roomId, turn_number,log) {
        return await this.query("INSERT INTO battle_logs(room_id, user_id, turn_number, action)  VALUES(?, ?, ?)", [roomId, userId, log]);
    }

    async getLogsByRoom(roomId) {
        return await this.query("SELECT * FROM battle_logs WHERE room_id = ?", [roomId]);
    }

    async getLogsByUser(userId) {
        return await this.query("SELECT * FROM battle_logs WHERE user_id = ?", [userId]);
    }

    async getLogsByTurn(turnNumber) {
        return this.query("SELECT * FROM battle_logs WHERE turn_number = ?", [turnNumber]);
    }

    async getLogsByUserAndTurn(userId, roomId, turnNumber) {
        return this.query(
            "SELECT * FROM battle_logs WHERE user_id = ? AND room_id = ? AND turn_number = ?",
            [userId, roomId, turnNumber]
        );
    }

}

module.exports = BattleLog;