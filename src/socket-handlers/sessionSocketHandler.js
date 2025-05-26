const { addUser, removeUserBySocket } = require('../utils/connectedUsers');

class SessionSocketHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;

        this.registerListeners();
    }

    registerListeners() {
        this.socket.on('init-session', this.handleInitSession.bind(this));

        this.socket.on('disconnect', () => {
            removeUserBySocket(this.socket.id);
            console.log(`[Session] Disconnected: ${this.socket.id}`);
        });
    }

    handleInitSession({ userId }) {
        if (!userId) {
            console.warn('[Session] No userId provided');
            return;
        }

        addUser(userId, this.socket.id);
        console.log(`[Session] User ${userId} mapped to socket ${this.socket.id}`);
    }
}

module.exports = SessionSocketHandler;
