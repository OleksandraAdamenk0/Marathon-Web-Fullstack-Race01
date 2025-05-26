require('dotenv').config();
const http = require('http');
const app = require('./app');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

app.set('io', io);

const socketIndex = require('./socket-handlers/socketIndex');
io.on('connection', socket => {
  console.log('🟢 WS Connected:', socket.id);
  socketIndex(io, socket);
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
