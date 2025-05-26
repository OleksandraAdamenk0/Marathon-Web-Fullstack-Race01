import socket from './socket.js';

socket.on('connect', () => {
  const userId = window.USER_ID;

  if (userId) {
    socket.emit('init-session', { userId });
    console.log('[Socket] Session initialized for userId:', userId);
  } else {
    console.warn('[Socket] No USER_ID in page context');
  }
});
