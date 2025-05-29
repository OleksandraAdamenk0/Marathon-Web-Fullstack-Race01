const PlayerModel = require('../models/Player');
const RoomModel = require('../models/Room');
const CardModel = require('../models/Card');
const TurnEngine = require('./engines/turnEngine');
const { sendMessageToUser, sendMessageToRoom } = require('./socketUtils');

const Player = new PlayerModel();
const Room = new RoomModel();
const Card = new CardModel();

class GameSocketHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;

        this.registerListeners();
    }

    registerListeners() {
    console.log('[GameSocket] Registering listeners for socket', this.socket.id);
        this.socket.on('start-game', this.handleStartGame.bind(this));
        this.socket.on('leave-game', this.handleLeaveGame.bind(this));
        this.socket.on('deal-deck', this.handleDealDeck.bind(this));
        this.socket.on('draw-card', this.handleDrawCards.bind(this));
        this.socket.on('start-turn',  this.handleStartTurn.bind(this));
        this.socket.on('end-turn',    this.handleEndTurn.bind(this));
        this.socket.on('play-card', this.handleTurn.bind(this));
    }

    async handleStartGame({ roomId, userId }) {
    if (!roomId || !userId) {
        console.warn('[GameSocket] Missing roomId or userId in start-game');
        return;
    }

    try {
        const room = await Room.getById(roomId);
        if (!room) return;

        const existing = await Player.getPlayerByUserAndRoom(userId, roomId);
        if (existing) {
            const opponent = await Player.getOpponent(roomId, userId);
            sendMessageToUser(this.io, userId, 'game-already-started', {
                role: existing.role,
                opponent: opponent,
                currentTurn: room.current_turn_player_id
            });
            return;
        }

        const assigned = await Player.defineRole(roomId, userId, Room);
        sendMessageToUser(this.io, userId, 'role-assigned', { role: assigned });

        const players = await Player.getPlayersByRoomId(roomId);
        console.log(players);
        if (players.length === 2) {
            const [p1, p2] = players;

            // Send opponent info to each player
            sendMessageToUser(this.io, p1.user_id, 'opponent-info', {
                opponent: {
                    userId: p2.user_id,
                    username: p2.username,
                    role: p2.role
                }
            });

            sendMessageToUser(this.io, p2.user_id, 'opponent-info', {
                opponent: {
                    userId: p1.user_id,
                    username: p1.username,
                    role: p1.role
                }
            });

            // Deal decks to both players
            await this.handleDealDeck({ roomId, userId: p1.user_id, role: p1.role });
            await this.handleDealDeck({ roomId, userId: p2.user_id, role: p2.role });
        }

        console.log(`[GameSocket] Assigned role ${assigned} to user ${userId} in room ${roomId}`);
    } catch (err) {
        console.error('[GameSocket] Failed to handle start-game:', err);
    }
}

    async handleStartTurn({ roomId, userId }) {
        if (!roomId || !userId) {
            console.warn('[GameSocket] Missing roomId or userId in start-turn');
            return;
        }
        try {
            await TurnEngine.startTurn(this.io, roomId);
        } catch (err) {
            console.error('[GameSocket] Failed to handle start-turn:', err);
        }
    }

    async handleEndTurn({ roomId, userId }) {
        if (!roomId || !userId) {
            console.warn('[GameSocket] Missing roomId or userId in start-turn');
            return;
        }
        try {
            await TurnEngine.endTurn(this.io, roomId);
        } catch (err) {
            console.error('[GameSocket] Failed to handle start-turn:', err);
        }
    }

    async handleLeaveGame({ roomId, userId }) {
        if (!roomId || !userId) {
            console.warn('[GameSocket] Missing roomId or userId in leave-game');
            return;
        }

        try {
            const players = await Player.getPlayersByRoomId(roomId);
            if (players.length < 2) {
                console.warn('[GameSocket] Not enough players in the room to process leave-game');
                return;
            }

            const leaver = players.find(p => p.user_id === userId);
            const opponent = players.find(p => p.user_id !== userId);

            if (!opponent) {
                console.warn('[GameSocket] Could not find opponent in leave-game');
                return;
            }

            await Room.setWinner(roomId, opponent.user_id);
            await Room.setFinishedStatus(roomId);

            this.io.to(roomId).emit('game-ended', {
                roomId,
                winner: opponent.user_id,
                loser: userId
            });

            console.log(`[GameSocket] Player ${userId} left the game. Opponent ${opponent.user_id} wins.`);
        } catch (err) {
            console.error('[GameSocket] Failed to handle leave-game:', err);
        }
    }


    async handleDealDeck({ roomId, userId, role }) {
        if (!roomId || !userId || !role) {
            console.warn('[GameSocket] Missing roomId, userId, or role in deal-deck');
            sendMessageToUser(this.io, userId, 'deck-error', {
                error: 'Missing required parameters'
            });
            return;
        }

        try {
            const player = await Player.getPlayerByUserAndRoom(userId, roomId);
            if (!player) {
                console.error('[GameSocket] Player not found for deck building');
                sendMessageToUser(this.io, userId, 'deck-error', {
                    error: 'Player not found'
                });
                return;
            }

            const teamType = role === 'survivor' ? 'survivors' : 'infected';

            const success = await Card.buildPlayerDeck(player.id, roomId, teamType);

            if (success) {
                const hand = await Card.getFormattedPlayerHand(player.id, roomId);
                const deckStats = await Card.getDeckStats(player.id, roomId);

		console.log(`[Server] Sending deck-built to user ${userId}`);
               sendMessageToUser(this.io, userId, 'deck-built', {
  		hand: hand,
  		deckStats: deckStats,
  		teamType: teamType
		});


                console.log(`[GameSocket] Successfully built deck for player ${userId} (${role})`);


                const bothReady = await Room.areBothPlayersReady(roomId);
                if (bothReady) {
                    await this.initializeMatch(roomId);
                }

            } else {
                sendMessageToUser(this.io, userId, 'deck-error', {
                    error: 'Failed to build deck'
                });
            }

        } catch (err) {
            console.error('[GameSocket] Failed to handle deal-deck:', err);
            sendMessageToUser(this.io, userId, 'deck-error', {
                error: 'Internal server error'
            });
        }
    }

    async initializeMatch(roomId) {
        try {
            console.log(`[GameSocket] Initializing match for room ${roomId}`);

            const gameData = await Room.initializeGameTurn(roomId);
            const roomWithPlayers = await Room.getRoomWithPlayers(roomId);

            // Notify both players that the match has started
            const matchStartData = {
                status: 'match-started',
                currentTurn: gameData.currentTurnUserId,
                players: {
                    player1: {
                        userId: roomWithPlayers.player1_user_id,
                        username: roomWithPlayers.player1_username,
                        role: roomWithPlayers.player1_role
                    },
                    player2: {
                        userId: roomWithPlayers.player2_user_id,
                        username: roomWithPlayers.player2_username,
                        role: roomWithPlayers.player2_role
                    }
                }
            };

            sendMessageToRoom(this.io, roomId, 'match-initialized', matchStartData);
            
            await TurnEngine.startTurn(this.io, roomId);

            console.log(`[GameSocket] Match started in room ${roomId}, first turn: user ${gameData.currentTurnUserId}`);

        } catch (error) {
            console.error('[GameSocket] Error initializing match:', error);
        }
    }

    getOpponentInfo(roomWithPlayers, currentUserId) {
        if (!roomWithPlayers) return null;

        if (roomWithPlayers.player1_user_id === currentUserId) {
            return roomWithPlayers.player2_user_id ? {
                userId: roomWithPlayers.player2_user_id,
                username: roomWithPlayers.player2_username,
                role: roomWithPlayers.player2_role
            } : null;
        } else {
            return roomWithPlayers.player1_user_id ? {
                userId: roomWithPlayers.player1_user_id,
                username: roomWithPlayers.player1_username,
                role: roomWithPlayers.player1_role
            } : null;
        }
    }

    async handleDrawCards({ roomId, userId, numberOfCards = 1 }) {
        if (!roomId || !userId) {
            console.warn('[GameSocket] Missing roomId or userId in draw-card');
            sendMessageToUser(this.io, userId, 'draw-error', {
                error: 'Missing required parameters'
            });
            return;
        }

        try {
            const player = await Player.getPlayerByUserAndRoom(userId, roomId);
            if (!player) {
                console.error('[GameSocket] Player not found for card drawing');
                sendMessageToUser(this.io, userId, 'draw-error', {
                    error: 'Player not found'
                });
                return;
            }

            const drawnCards = await Card.drawCards(player.id, roomId, numberOfCards);

            if (drawnCards.length > 0) {
                const deckStats = await Card.getDeckStats(player.id, roomId);

                sendMessageToUser(this.io, userId, 'cards-drawn', {
                    drawnCards: drawnCards,
                    deckStats: deckStats
                });

                console.log(`[GameSocket] Drew ${drawnCards.length} cards for player ${userId}`);
            } else {
                sendMessageToUser(this.io, userId, 'draw-error', {
                    error: 'No cards available to draw'
                });
            }

        } catch (err) {
            console.error('[GameSocket] Failed to handle draw-card:', err);
            sendMessageToUser(this.io, userId, 'draw-error', {
                error: 'Internal server error'
            });
        }
    }

    async handleTurn(payload) {

        const { roomId, userId, data } = payload;

        const result = await TurnEngine.playCard({
            roomId,
            userId,
            cardId     : data.cardId,
            destination: data.destination
        });

        if (!result.ok) {
            sendMessageToUser(this.io, userId, 'turn-error', { reason: result.reason });
            return;
        }


        sendMessageToUser(this.io, userId, 'hand-update', { hand: result.hand });
        await sendMessageToRoom(this.io, roomId, 'board-update', { board: result.boardState });
    }
}

module.exports = GameSocketHandler;
