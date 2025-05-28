// socket.js
window.socket = io(); // No exports!


// Automatically initialize session once connected
socket.on('connect', () => {
  const userId = window.USER_ID;
  if (userId) {
    socket.emit('init-session', { userId });
    console.log('[Socket] Session initialized for userId:', userId);
  } else {
    console.warn('[Socket] No USER_ID in page context');
  }
});

