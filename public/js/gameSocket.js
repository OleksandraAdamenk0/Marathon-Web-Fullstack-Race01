import socket from './socket.js';

if (!sessionStorage.getItem('alreadyReloaded')) {
  sessionStorage.setItem('alreadyReloaded', 'false');
}

socket.on('connect', () => {
  const roomId = window.ROOM_ID;
  const userId = window.USER_ID;
  const username = window.USERNAME;

  if (roomId && userId && username) {
    socket.emit('join-room', {
      roomId,
      user: { id: userId, username }
    });
    console.log(`[Socket] Sent join-room for room ${roomId}`);

    socket.emit('start-game', { roomId, userId });
    console.log('[Client] Sent start-game', { roomId, userId });
  } else {
    console.warn('[Socket] Missing ROOM_ID or USER_ID on connect');
  }
});

socket.on('role-assigned', (data) => {
  console.log('[Client] Role assigned:', data);
});

socket.on('game-already-started', (data) => {
  console.log('[Client] Game already started:', data);
});

socket.on('deck-built', (data) => {
  console.log('[Client] Received starting hand:', data);
});

socket.on('room-update', async ({ roomId }) => {
    if (!window.ROOM_ID || window.ROOM_ID !== roomId.toString()) return;
  
    try {
      const response = await fetch(`/api/room/${roomId}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
  
      const roomData = await response.json();
      console.log('[Room UI] Room data fetched:', roomData);
  
      const p1 = document.getElementById('player1-name');
      const p2 = document.getElementById('player2-name');
  
      if (p1) p1.textContent = roomData.player1?.username || 'Waiting...';
      if (p2) p2.textContent = roomData.player2?.username || 'Waiting...';
  
      const isPlayer1 = roomData.player1?.id?.toString() === window.USER_ID?.toString();
      const bothPlayersPresent = roomData.player1 && roomData.player2;
      const reloaded = sessionStorage.getItem('alreadyReloaded') === 'true';
  
      if (isPlayer1 && bothPlayersPresent && !reloaded) {
        console.log('[Room UI] Player 1 sees both players. Reloading once...');
        sessionStorage.setItem('alreadyReloaded', 'true');
        window.location.reload();
      }
  
    } catch (err) {
      console.error('[Room UI] Failed to reload room UI:', err);
    }
  });
  
