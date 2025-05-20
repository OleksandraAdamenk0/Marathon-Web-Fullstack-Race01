const Model = require("./Model");

class Card extends Model {
    constructor() {
        super("cards");
    }

    async getSpecificRandomCard(team_type, card_types) {
        const placeholders = card_types.map(() => '?').join(', ');
        const query = `SELECT * FROM cards WHERE team_type = ? AND card_type IN (${placeholders}) ORDER BY RAND() LIMIT 1`;
        const card = await this.query(query, [team_type, card_types]);
        if (!card) return null;
        return this.specifyCardData(card.id, card.card_type);
    }

    async getRandomCreatureCard(team_type) {
        const query = `SELECT * FROM cards JOIN creatures_cards ON creatures_cards.id = cards.id WHERE cards.card_type = 'creature' AND cards.team_type = ? ORDER BY RAND() LIMIT 1`;
        return await this.query(query, [team_type]);
    }

    async getRandomLeaderCard(team_type) {
        const query = `SELECT * FROM cards JOIN leaders_cards ON leaders_cards.id = cards.id WHERE cards.card_type = 'creature' AND cards.team_type = ? ORDER BY RAND() LIMIT 1`;
        return await this.query(query, [team_type]);
    }

    async getRandomSpellCard(team_type) {
        const query = `SELECT * FROM cards JOIN spells_cards ON spells_cards.id = cards.id WHERE cards.card_type = 'creature' AND cards.team_type = ? ORDER BY RAND() LIMIT 1`;
        return await this.query(query, [team_type]);
    }

    async getRandomEnergyCard(team_type) {
        const query = `SELECT * FROM cards JOIN energy_farmer_cards ON energy_farmer_cards.id = cards.id WHERE cards.card_type = 'creature' AND cards.team_type = ? ORDER BY RAND() LIMIT 1`;
        return await this.query(query, [team_type]);
    }

    async specifyCardData(card_id, card_type) {
        async function getAllData(table) {
            const query = `SELECT * FROM cards JOIN ${table} ON ${table}.id = cards.id WHERE cards.id = ?`
            const allCardData = await this.query(query, [card_id]);
            if (!allCardData) return null;
            return allCardData[0];
        }
        switch (card_type) {
            case "creature": return await getAllData("creatures_cards");
            case "leader": return getAllData("leaders_cards");
            case "spell": return getAllData("spells_cards");
            case "energy": return getAllData("energy_farmer_cards");
            default: return null;
        }
    }

    async getRandomCard(team_type) {
        const randomCard = await this.query("SELECT * FROM cards WHERE team_type = ? ORDER BY RAND() LIMIT 1", [type]);
        if (!randomCard) return null;
        return await this.specifyCardData(randomCard.id, randomCard.card_type);

    }
}

module.exports = Card;