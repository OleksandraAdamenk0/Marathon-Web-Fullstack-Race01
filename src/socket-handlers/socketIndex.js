const RoomSocketHandler = require('./roomSocketHandler');
const GameSocketHandler = require('./gameSocketHandler');
const SessionSocketHandler = require('./sessionSocketHandler');


module.exports = function registerHandlers(io, socket) {
    new SessionSocketHandler(io, socket);
    new RoomSocketHandler(io, socket);
    new GameSocketHandler(io, socket);
};
