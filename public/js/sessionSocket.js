const socket = io();

const userId = localStorage.getItem('userId');


socket.on('connect', () => {
  console.log('[Socket] Connected:', socket.id);

  if (userId) {
    socket.emit('init-session', { userId });
    console.log('[Socket] Session initialized for user:', userId);
  } else {
    console.warn('[Socket] No userId found to initialize session');
  }
});

socket.on('reconnect', () => {
  console.log('[Socket] Reconnected:', socket.id);
  if (userId) {
    socket.emit('init-session', { userId });
  }
});

export default socket;
