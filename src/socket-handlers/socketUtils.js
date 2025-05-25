const connectedUsers = require('../utils/connectedUsers');

function sendMessageToUser(io, userId, event, data) {
    const socketId = connectedUsers.getSocketId(userId);
    if (!socketId) {
        console.warn(`[SocketUtils] No socket found for user ${userId}`);
        return;
    }

    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
        console.warn(`[SocketUtils] Socket ${socketId} not found for user ${userId}`);
        return;
    }

    socket.emit(event, data);
}

async function sendMessageToRoom(io, roomId, event, data) {
    try {
        const RoomModel = require('../models/Room');
        const Room = new RoomModel();

        const roomWithPlayers = await Room.getRoomWithPlayers(roomId);
        if (!roomWithPlayers) {
            console.warn(`[SocketUtils] Room ${roomId} not found`);
            return;
        }

        if (roomWithPlayers.player1_user_id) {
            sendMessageToUser(io, roomWithPlayers.player1_user_id, event, data);
        }
        if (roomWithPlayers.player2_user_id) {
            sendMessageToUser(io, roomWithPlayers.player2_user_id, event, data);
        }

        console.log(`[SocketUtils] Sent ${event} to room ${roomId}`);
    } catch (error) {
        console.error('[SocketUtils] Error sending message to room:', error);
    }
}

module.exports = {
    sendMessageToUser,
    sendMessageToRoom
};