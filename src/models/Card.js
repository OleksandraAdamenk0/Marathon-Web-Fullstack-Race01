const Model = require('./Model');
const HANDSIZE = 6;

class Card extends Model {
    constructor() {
        super('cards');
    }

    async getCardsByTeam(teamType) {
        const sql = `
            SELECT * FROM cards 
            WHERE team_type = ? 
            ORDER BY card_type, name
        `;

        try {
            const results = await this.query(sql, [teamType]);
            return results;
        } catch (error) {
            console.error('[Card Model] Error getting cards by team:', error);
            throw error;
        }
    }

    async getGuaranteedCards(teamType) {
        const guaranteedCardNames = teamType === 'survivors'
            ? ['survivor_leader_1', 'survivor_energy_1']
            : ['infected_leader_1', 'infected_energy_1'];

        const sql = `
            SELECT * FROM cards 
            WHERE name IN (${guaranteedCardNames.map(() => '?').join(',')})
        `;

        try {
            const results = await this.query(sql, guaranteedCardNames);
            return results;
        } catch (error) {
            console.error('[Card Model] Error getting guaranteed cards:', error);
            throw error;
        }
    }

    async buildPlayerDeck(playerId, roomId, teamType) {
        console.log(`[Card Model] Building deck for player ${playerId}, team: ${teamType}`);

        try {
            const cards = await this.getCardsByTeam(teamType);
            const guaranteedCards = await this.getGuaranteedCards(teamType);

            if (!cards.length) {
                throw new Error(`No cards found for team: ${teamType}`);
            }

            const cardInstances = [];

            cards.forEach(card => {
                for (let i = 1; i <= card.deck_quantity; i++) {
                    cardInstances.push({
                        player_id: playerId,
                        card_id: card.id,
                        room_id: roomId,
                        zone: 'deck',
                        instance_number: i
                    });
                }
            });

            if (cardInstances.length > 0) {
                const insertSql = `
                    INSERT INTO players_cards (player_id, card_id, room_id, zone, instance_number)
                    VALUES ?
                `;

                const values = cardInstances.map(instance => [
                    instance.player_id,
                    instance.card_id,
                    instance.room_id,
                    instance.zone,
                    instance.instance_number
                ]);

                await this.query(insertSql, [values]);
                console.log(`[Card Model] Successfully built deck with ${cardInstances.length} cards`);

                await this.shuffleDeck(playerId, roomId);
                await this.drawStartingHand(playerId, roomId, HANDSIZE);

                await this.addGuaranteedCardsToHand(playerId, roomId, guaranteedCards);

                return true;
            }

            return false;
        } catch (error) {
            console.error('[Card Model] Error building player deck:', error);
            throw error;
        }
    }

    async addGuaranteedCardsToHand(playerId, roomId, guaranteedCards) {
        try {
            for (const card of guaranteedCards) {
                const existingInHand = await this.query(`
                    SELECT pc.id FROM players_cards pc
                    WHERE pc.player_id = ? AND pc.room_id = ? AND pc.card_id = ? AND pc.zone = 'hand'
                    LIMIT 1
                `, [playerId, roomId, card.id]);

                if (existingInHand.length === 0) {
                    // Find this card in deck and move to hand
                    const cardInDeck = await this.query(`
                        SELECT pc.id FROM players_cards pc
                        WHERE pc.player_id = ? AND pc.room_id = ? AND pc.card_id = ? AND pc.zone = 'deck'
                        LIMIT 1
                    `, [playerId, roomId, card.id]);

                    if (cardInDeck.length > 0) {
                        await this.query(`
                            UPDATE players_cards 
                            SET zone = 'hand', position = NULL 
                            WHERE id = ?
                        `, [cardInDeck[0].id]);

                        console.log(`[Card Model] Added guaranteed card ${card.name} to hand for player ${playerId}`);
                    }
                }
            }
        } catch (error) {
            console.error('[Card Model] Error adding guaranteed cards to hand:', error);
            throw error;
        }
    }

    async shuffleDeck(playerId, roomId) {
        try {
            const deckCards = await this.getPlayerCardsByZone(playerId, roomId, 'deck');

            const shuffledPositions = deckCards.map((_, index) => index + 1).sort(() => Math.random() - 0.5);

            for (let i = 0; i < deckCards.length; i++) {
                await this.query(
                    'UPDATE players_cards SET position = ? WHERE id = ?',
                    [shuffledPositions[i], deckCards[i].id]
                );
            }

            console.log(`[Card Model] Shuffled deck for player ${playerId}`);
        } catch (error) {
            console.error('[Card Model] Error shuffling deck:', error);
            throw error;
        }
    }

    async drawStartingHand(playerId, roomId, handSize) {
        try {
            const sql = `
                UPDATE players_cards 
                SET zone = 'hand' 
                WHERE player_id = ? AND room_id = ? AND zone = 'deck'
                ORDER BY position ASC
                LIMIT ?
            `;

            await this.query(sql, [playerId, roomId, handSize]);
            console.log(`[Card Model] Drew ${handSize} cards for player ${playerId}`);
        } catch (error) {
            console.error('[Card Model] Error drawing starting hand:', error);
            throw error;
        }
    }

    async getPlayerCardsByZone(playerId, roomId, zone) {
        const sql = `
            SELECT pc.*, c.name, c.attack, c.defense, c.cost, c.card_type, c.description, c.image_url, c.team_type
            FROM players_cards pc
            JOIN cards c ON pc.card_id = c.id
            WHERE pc.player_id = ? AND pc.room_id = ? AND pc.zone = ?
            ORDER BY pc.position ASC, pc.id ASC
        `;

        try {
            const results = await this.query(sql, [playerId, roomId, zone]);
            return results;
        } catch (error) {
            console.error('[Card Model] Error getting player cards by zone:', error);
            throw error;
        }
    }

    async getFormattedPlayerHand(playerId, roomId) {
        try {
            const handCards = await this.getPlayerCardsByZone(playerId, roomId, 'hand');

            return handCards.map(card => ({
                id: card.id, // players_cards table id
                cardId: card.card_id, // original card id
                name: card.name,
                cost: card.cost,
                attack: card.attack,
                defense: card.defense,
                cardType: card.card_type,
                description: card.description,
                imageUrl: card.image_url,
                teamType: card.team_type,
                zone: card.zone,
                position: card.position,
                instanceNumber: card.instance_number,
                isActive: card.is_active
            }));
        } catch (error) {
            console.error('[Card Model] Error getting formatted player hand:', error);
            throw error;
        }
    }

    async drawCards(playerId, roomId, numberOfCards = 1) {
        try {
            const sql = `
                SELECT pc.id
                FROM players_cards pc
                WHERE pc.player_id = ? AND pc.room_id = ? AND pc.zone = 'deck'
                ORDER BY pc.position ASC
                LIMIT ?
            `;

            const topCards = await this.query(sql, [playerId, roomId, numberOfCards]);

            if (topCards.length === 0) {
                console.warn(`[Card Model] No cards left in deck for player ${playerId}`);
                return [];
            }

            const cardIds = topCards.map(card => card.id);
            const updateSql = `
                UPDATE players_cards 
                SET zone = 'hand', position = NULL 
                WHERE id IN (${cardIds.map(() => '?').join(',')})
            `;

            await this.query(updateSql, cardIds);

            const drawnCards = await this.query(`
                SELECT pc.*, c.name, c.attack, c.defense, c.cost, c.card_type, c.description, c.image_url, c.team_type
                FROM players_cards pc
                JOIN cards c ON pc.card_id = c.id
                WHERE pc.id IN (${cardIds.map(() => '?').join(',')})
            `, cardIds);

            console.log(`[Card Model] Drew ${drawnCards.length} cards for player ${playerId}`);

            return drawnCards.map(card => ({
                id: card.id,
                cardId: card.card_id,
                name: card.name,
                cost: card.cost,
                attack: card.attack,
                defense: card.defense,
                cardType: card.card_type,
                description: card.description,
                imageUrl: card.image_url,
                teamType: card.team_type,
                zone: card.zone,
                instanceNumber: card.instance_number,
                isActive: card.is_active
            }));

        } catch (error) {
            console.error('[Card Model] Error drawing cards:', error);
            throw error;
        }
    }

    async moveCard(playerCardId, newZone, newPosition = null) {
        try {
            const sql = `
                UPDATE players_cards 
                SET zone = ?, position = ?
                WHERE id = ?
            `;

            await this.query(sql, [newZone, newPosition, playerCardId]);
            console.log(`[Card Model] Moved card ${playerCardId} to ${newZone}`);
        } catch (error) {
            console.error('[Card Model] Error moving card:', error);
            throw error;
        }
    }

    async getDeckStats(playerId, roomId) {
        const sql = `
            SELECT 
                zone,
                COUNT(*) as count
            FROM players_cards 
            WHERE player_id = ? AND room_id = ?
            GROUP BY zone
        `;

        try {
            const results = await this.query(sql, [playerId, roomId]);
            return results.reduce((stats, row) => {
                stats[row.zone] = row.count;
                return stats;
            }, {});
        } catch (error) {
            console.error('[Card Model] Error getting deck stats:', error);
            throw error;
        }
    }

    async getNextCardFromDeck(playerId, roomId) {
        try {
            const nextCards = await this.drawCards(playerId, roomId, 1);
            return nextCards[0] || null;
        } catch (error) {
            console.error('[Card Model] Error getting next card from deck:', error);
            throw error;
        }
    }
}

module.exports = Card;