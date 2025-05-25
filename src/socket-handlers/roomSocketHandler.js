const RoomModel = require('../models/Room');
const roomModel = new RoomModel();

class RoomSocketHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;

        this.registerListeners();
    }

    registerListeners() {
        this.socket.on('join-room', this.handleJoinRoom.bind(this));
        this.socket.on('leave-room', this.handleLeaveRoom.bind(this));
    }

    async handleJoinRoom({ roomId, user }) {
        this.socket.join(roomId);
        console.log(`[RoomSocket] ${user.username} (${this.socket.id}) joined room ${roomId}`);

        this.socket.to(roomId).emit('player-joined', {
            user,
            socketId: this.socket.id,
        });

        if (await this.utilReadyToStart(roomId)) {
            this.socket.to(roomId).emit('ready-to-start', { roomId });
        }
    }

    async handleLeaveRoom({ roomId, user }) {
        this.socket.leave(roomId);
        console.log(`[RoomSocket] ${user.username} (${this.socket.id}) left room ${roomId}`);

        this.socket.to(roomId).emit('player-left', {
            user,
            socketId: this.socket.id,
        });
    }

    async utilReadyToStart(roomId) {
        try {
            const room = await roomModel.getById(roomId);
            return room && room.player_one_id !== null && room.player_two_id !== null;
        } catch (err) {
            console.error('[RoomSocket] Failed to check room readiness:', err);
            return false;
        }
    }
}

module.exports = RoomSocketHandler;
