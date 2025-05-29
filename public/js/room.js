window.addEventListener('beforeunload', () => {
    const roomId = window.ROOM_ID;
    const userId = window.USER_ID;

    if (socket && socket.connected) {
        socket.emit('leave-room', { roomId, userId });
        socket.disconnect();
    }
});