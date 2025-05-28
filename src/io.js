// set up socket.io
const http  = require('node:http');
const socket = require("socket.io");
const app = require('./app');
const registerHandlers = require('./socket-handlers/socketIndex');

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('🟢 WS Connected:', socket.id);
    registerHandlers(io, socket);
});

module.exports = server;

