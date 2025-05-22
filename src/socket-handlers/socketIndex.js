const RoomSocketHandler = require('./roomSocketHandler');
const GameSocketHandler = require('./gameSocketHandler');

module.exports = function registerHandlers(io, socket) {
    new RoomSocketHandler(io, socket);
    new GameSocketHandler(io, socket);
};
