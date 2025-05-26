const connectedUsers = new Map();

function addUser(userId, socketId) {
    connectedUsers.set(userId, socketId);
}

function removeUserBySocket(socketId) {
    for (const [userId, sId] of connectedUsers.entries()) {
        if (sId === socketId) {
            connectedUsers.delete(userId);
            break;
        }
    }
}

function getSocketId(userId) {
    return connectedUsers.get(userId);
}

function hasUser(userId) {
    return connectedUsers.has(userId);
}

module.exports = {
    addUser,
    removeUserBySocket,
    getSocketId,
    hasUser,
};
