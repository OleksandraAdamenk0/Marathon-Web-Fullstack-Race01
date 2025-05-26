const socket = io();

socket.emit('start-game', { roomId: ROOM_ID, userId: USER_ID });
console.log('[Client] Sent start-game', { roomId: ROOM_ID, userId: USER_ID });

socket.on('role-assigned', (data) => {
  console.log('[Client] Role assigned:', data);
});

socket.on('game-already-started', (data) => {
  console.log('[Client] Game already started:', data);
});

socket.on('deck-built', (data) => {
  console.log('[Client] Received starting hand:', data);
});
