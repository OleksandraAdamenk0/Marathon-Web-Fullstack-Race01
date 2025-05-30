const PlayersCards = require('../../models/PlayersCards');
const Player = require('../../models/Player');
const Card = require('../../models/Card');
const Room = require('../../models/Room');
const BattleLogs = require('../../models/BattleLog');

const playersCards = new PlayersCards();
const playerModel = new Player();
const cardModel = new Card();
const roomModel = new Room();
const battleLogsModel = new BattleLogs();

class TurnValidation {
    static isDestinationValid(cardType, destination) {
        const allowedDestinations = {
            energy_farmer: ['farm', 'discard'],
            leader: ['leader', 'board', 'hand', 'discard'],
            creature: ['board', 'discard'],
            spell: []
        };

        const allowed = allowedDestinations[cardType] || [];
        return allowed.includes(destination);
    }

    static async canPlayEnergyFarmerToFarm(cardType, destination, roomId, userId, turnNumber) {
        if (cardType !== 'energy_farmer' || destination !== 'farm') {
            return true;
        }

        const logs = await battleLogsModel.getLogsByUserAndTurn(userId, roomId, turnNumber);

        for (const log of logs) {
            try {
                const actionData = JSON.parse(log.action);

                if (
                    actionData.action === 'play-card' &&
                    actionData.card?.card_type === 'energy_farmer' &&
                    actionData.destination === 'farm'
                ) {
                    return false;
                }
            } catch (err) {
                console.warn('[Validation] Invalid log JSON in battle_logs:', err);
            }
        }

        return true;
    }
}


class TurnEngine {
    static async startTurn(io, roomId) {
        await playersCards.resetAllDefense(roomId);

        const turn = await roomModel.getTurnNumber(roomId);
        const room  = await roomModel.getById(roomId);
        const nextPlayer = (turn % 2 === 1)
            ? room.player_one_id
            : room.player_two_id;

        console.log(`[TurnEngine] Setting next player ${nextPlayer} for room ${roomId}`);
        await roomModel.setTurnPlayer(roomId, nextPlayer);

        io.to(roomId).emit('turn-started', {
            roomId,
            turnNumber: turn,
            currentPlayer: nextPlayer
        });
    }

    static async endTurn(io, roomId) {
        if (await this.checkGameEnd(io, roomId)) return;

        await roomModel.incrementTurn(roomId);

 

        const newTurn = await roomModel.getTurnNumber(roomId);
        const room = await roomModel.getById(roomId);

        console.log('[TurnEngine] room.player_two_id:', room.player_two_id);
        const currentPlayer = room.current_turn_player_id;

        const nextPlayer = currentPlayer === room.player_one_id
        ? room.player_two_id
        : room.player_one_id;

        console.log(`[TurnEngine] Turn incremented. New turn = ${newTurn}`);
        console.log('[TurnEngine] room.player_one_id:', room.player_one_id);
        await roomModel.setTurnPlayer(roomId, nextPlayer);

        io.to(roomId).emit('turn-started', {
            roomId,
            turnNumber: newTurn,
            currentPlayer: nextPlayer
        });
    }

    static async checkGameEnd(io, roomId) {
        const players = await playerModel.getPlayersByRoomId(roomId);
        const [p1, p2] = players;
        if (p1.health <= 0 || p2.health <= 0) {
            const winner = p1.health > 0 ? p1 : p2;
            const loser  = p1.health > 0 ? p2 : p1;

            await roomModel.setWinner(roomId, winner.user_id);
            await roomModel.setFinishedStatus(roomId);

            io.to(roomId).emit('game-ended', {
                roomId,
                winner:  winner.user_id,
                loser:   loser.user_id
            });
            return true;
        }
        return false;
    }

    static async playCard({roomId, userId, cardId, destination}) {

        const whosTurn = await roomModel.getTurnPlayer(roomId);
        if (whosTurn.current_turn_player_id !== Number(userId)) return {ok: false, reason: 'Not your turn'};

        const room = await roomModel.getById(roomId);
        if (!room) return {ok: false, reason: 'Room not found'};

        const player = await playerModel.getPlayersByRoomId(userId, roomId);

        const pcard = await playersCards.getByPlayerCardId(cardId, roomId, 'hand');
        if (!pcard) return { ok: false, reason: 'Card not in hand' };
        console.log('pcard', JSON.stringify(pcard));

        let position = null;
        if (destination === 'board') {
            const existing = await playersCards.getBoardForPlayer(pcard.player_id, roomId);
            if (existing.length) {
                const maxPos = Math.max(...existing.map(r => r.position || 0));
                position = maxPos + 1;
            } else {
                position = 1;
            }
        }

        if (player.energy < pcard.cost) return {ok: false, reason: 'Not enough energy'};

        if (!TurnValidation.isDestinationValid(pcard.card_type, destination)) {
            return { ok: false, reason: 'Invalid destination for this card type' };
        }
        if(!await TurnValidation.canPlayEnergyFarmerToFarm(pcard.card_type, destination, roomId, userId, room.turn_number)) {
            return {ok: false, reason: 'Energy farmer can only be played once every turn'};
        }

        await playersCards.moveCard(pcard.id, destination, position);
        await playerModel.updateEnergyByPlayerId(player.id, -pcard.cost);

        const hand = await playersCards.getHand(player.id, roomId);
        const board = await playersCards.getBoardState(roomId);


        await battleLogsModel.writeLog(
            userId,
            roomId,
            room.turn_number,
            JSON.stringify({
                playerId: player.id,
                action: 'play-card',
                card: pcard.name,
                destination: destination,
            })
    );

        return {ok: true, hand, boardState: board};
    }

    static async getBuffsForPlayer(roomId, playerId, isAttacker) {
        const leaderPC = await playersCards.getSpecific(
            playerId, roomId, /* cardId */ null, 'leader'
        );
        if (!leaderPC) return { atk: 0, def: 0 };

        const card = await cardModel.getById(leaderPC.card_id);

        const mapping = {
            Operative:     { atk: 0, defWhenAttacking: 1, defWhenDefending: 0 },
            Marshall:      { atk: 0, defWhenAttacking: 0, defWhenDefending: 2 },
            Commander:     { atk: 1, defWhenAttacking: 0, defWhenDefending: 0 },
            Prime_Husk:    { atkWhenDefending: 1, def: 0 },
            Plague_Lord:   { atk: 0, defAll: 2 },
            The_Queen:     { atkAll: 2, def: 0 },
        };

        const cfg = mapping[card.name] || {};

        let atk = 0, def = 0;
        if (cfg.atkAll)  atk = cfg.atkAll;
        if (cfg.defAll)  def = cfg.defAll;

        if (isAttacker && cfg.defWhenAttacking) {
            def = cfg.defWhenAttacking;
        }
        if (!isAttacker && cfg.atkWhenDefending) {
            atk = cfg.atkWhenDefending;
        }
        if (!isAttacker && cfg.defWhenDefending) {
            def = cfg.defWhenDefending;
        }

        return { atk, def };
    }

    static async attack({ roomId, userId }) {
        const turnNumber = await roomModel.getTurnNumber(roomId);
        if (turnNumber <= 2) return { ok: false, reason: 'Cannot attack before turn 3' };
        const current = await roomModel.getTurnPlayer(roomId);
        if (current !== userId) return { ok: false, reason: 'Not your turn' };
        const room = await roomModel.getById(roomId);
        if (!room) return { ok: false, reason: 'Room not found' };

        const board = await playersCards.getBoardState(roomId);
        const ourTroops = board.filter(pc => pc.user_id === userId && pc.zone === 'board')
            .sort((a,b) => a.position - b.position);
        const oppId = room.player_one_id === userId ? room.player_two_id : room.player_one_id;
        const theirTroops = board.filter(pc => pc.user_id === oppId && pc.zone === 'board')
            .sort((a,b)=>a.position - b.position);
        if (!ourTroops.length || !theirTroops.length) {
            return { ok: false, reason: 'No valid troops to attack' };
        }

        let lastDefIdx = theirTroops.length - 1;
        for (let i=0; i<ourTroops.length; i++) {
            const attacker = ourTroops[i];
            const defIdx   = i < theirTroops.length ? i : lastDefIdx;
            const defender = theirTroops[defIdx];
            if (!defender) break;

            const attDamage = attacker.attack;
            const defDamage = defender.attack;

            const spillToOpponent = attDamage - defender.current_defense;
            const spillToAttacker = defDamage - attacker.current_defense;

            if (spillToOpponent > 0) {
                await playerModel.updateHealthByPlayerId(defender.player_id, -spillToOpponent);
            }
            if (spillToAttacker > 0) {
                await playerModel.updateHealthByPlayerId(attacker.player_id, -spillToAttacker);
            }

            const newAttDef = attacker.current_defense - defDamage;
            const newDefDef = defender.current_defense - attDamage;

            if (newAttDef <= 0) {
                await playersCards.moveFromBoardToDiscard(
                    attacker.player_id, roomId, attacker.card_id, attacker.instance_number
                );
            } else {
                await playersCards.updateCurrentDefense(
                    attacker.player_id, roomId, attacker.card_id, attacker.instance_number, -defDamage
                );
            }

            if (newDefDef <= 0) {
                await playersCards.moveFromBoardToDiscard(
                    defender.player_id, roomId, defender.card_id, defender.instance_number
                );
                theirTroops.splice(defIdx,1);
                lastDefIdx = theirTroops.length - 1;
            } else {
                await playersCards.updateCurrentDefense(
                    defender.player_id, roomId, defender.card_id, defender.instance_number, -attDamage
                );
            }

            await battleLogsModel.writeLog(
                defender.user_id, roomId, room.turn_number,
                JSON.stringify({
                    action: 'attack',
                    attacker: { cardId: attacker.card_id, instance: attacker.instance_number },
                    defender: { cardId: defender.card_id, instance: defender.instance_number },
                    damage: { toAttacker: defDamage, toDefender: attDamage }
                })
            );
        }


        const updatedBoard = await playersCards.getBoardState(roomId);
        return { ok: true, board: updatedBoard };
    }

}

module.exports = TurnEngine;
