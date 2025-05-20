const http  = require('node:http');
const socket = require("socket.io");

const app = require('./app');

const HTTPserver = http.createServer(app)
const io = new socket.Server(HTTPserver);

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
});

module.exports = HTTPserver