window.addEventListener('beforeunload', () => {
    const roomId = window.ROOM_ID;
    const userId = window.USER_ID;

    if (socket && socket.connected) {
        socket.emit('leave-room', { roomId, userId });
        socket.disconnect();
    }
});

socket.on('player-joined', ({ user, socketId }) => {
    console.log('[Room] A player joined:', user.username);

    const p2 = document.getElementById('player2-name');
    if (p2 && user.id !== window.USER_ID) {
        p2.textContent = user.username;
    }

    socket.emit('room-update', { roomId: window.ROOM_ID });
});
