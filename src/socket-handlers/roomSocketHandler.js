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
     console.log(`[Server] handleJoinRoom triggered for ${user.username} in room ${roomId}`);
        this.socket.user = user;
        this.socket.roomId = roomId;
        this.socket.join(roomId);
        console.log(`[RoomSocket] ${user.username} (${this.socket.id}) joined room ${roomId}`);

        this.socket.to(roomId).emit('player-joined', {
            user,
            socketId: this.socket.id,
        });
        
        this.io.to(roomId).emit('room-update', { roomId });
console.log(`[Server] Emitted room-update for room ${roomId}`);


        if (await this.utilReadyToStart(roomId)) {
            this.socket.to(roomId).emit('ready-to-start', { roomId });
            console.log(`[RoomSocket] Emitting ready-to-start for room ${roomId}`);
        }
    }

    async handleLeaveRoom({ roomId }) {
        const user = this.socket.user;

        this.socket.leave(roomId);
        console.log(`[RoomSocket] ${user?.username || 'Unknown'} (${this.socket.id}) left room ${roomId}`);

        this.socket.to(roomId).emit('player-left', {
            user,
            socketId: this.socket.id,
        });

        const room = await roomModel.getById(roomId);

        const opponentUserId = room.player_one_id.toString() === user.id
            ? room.player_two_id
            : room.player_one_id;

        if (opponentUserId) {
            await roomModel.setWinner(roomId, opponentUserId);
            await roomModel.setFinishedStatus(roomId);

            const { connectedUsers } = require('./socketUtils');
            const opponentSocketId = connectedUsers.get(opponentUserId);

            if (opponentSocketId) {
                this.io.to(opponentSocketId).emit('game-ended', {
                    roomId,
                    winner: opponentUserId,
                    loser: user.id
                });

                this.io.to(opponentSocketId).emit('redirect-to-menu', { roomId });
                console.log(`[RoomSocket] Notified opponent (${opponentUserId}) that game ended`);
            } else {
                console.warn(`[RoomSocket] Opponent (${opponentUserId}) socket not found`);
            }
        }

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
