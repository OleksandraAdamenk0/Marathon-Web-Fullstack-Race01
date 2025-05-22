const http  = require('node:http');
const socket = require("socket.io");

const app = require('./app');

const HTTPserver = http.createServer(app)
const io = new socket.Server(HTTPserver);

const registerSocketHandlers = require('./socket-handlers/socketIndex');

io.on('connection', (socket) => {
    console.log('🟢 WS Connected:', socket.id);
    registerSocketHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log('🔴 WS Disconnected:', socket.id);
    });
});

module.exports = HTTPserver