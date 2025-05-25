/*
const cardsData = `
INSERT INTO cards (name, image_url, attack, defense, cost, team_type, card_type, description) VALUES
('goodGuy1', 'card1.png', 5, 4, 6, 'survivors', 'creature', 'A good guy'),
('goodGuy2', 'card2.png', 4, 3, 7, 'survivors', 'creature', 'A good guy'),
('goodGuy3', 'card3.png', 6, 2, 6, 'survivors', 'creature', 'A good guy'),
('goodGuy4', 'card.png', 7, 3, 5, 'survivors', 'creature', 'A good guy'),
('goodGuy5', 'card5.png', 3, 4, 8, 'survivors', 'creature', 'A good guy'),
('goodGuy6', 'card6.png', 5, 5, 5, 'survivors', 'creature', 'A good guy'), 
('goodGuy7', 'card7.png', 4, 6, 5, 'survivors', 'creature', 'A good guy'),
('goodGuy8', 'card8.png', 2, 5, 8, 'survivors', 'creature', 'A good guy'),
('goodGuy9', 'card9.png', 6, 5, 4, 'survivors', 'creature', 'A good guy'),
('goodGuy10', 'card10.png', 4, 4, 7, 'survivors', 'creature', 'A good guy'),
('Nest of Decay', 'nestOfDecay.png', 0, 0, 5, 'infected', 'energy_farmer', 'A rotting core that pulses with regenerative spores, fueling the swarm.'),
('Spores urge', 'sporesUrge.png', 0, 0, 6, 'infected', 'energy_farmer', 'Unstable spores surge with energy but corrode everything nearby. Deals 2 damage to you when placed. Can only be placed once per game.'),
('Gnawing', 'gnawing.png', 1, 1, 1, 'infected', 'creature', 'Countless teeth and hunger. Weak alone, deadly in numbers.'),
('Infect', 'infect.png', 2, 3, 2, 'infected', 'creature', 'A parasite that spreads through violence.'),
('Ravager Grub', 'ravagerGrub.png', 4, 1, 3, 'infected', 'creature', 'Fast-growing and ravenous, it tears through defenses.'),
('Mutalisk', 'mutalisk.png', 3, 6, 5, 'infected', 'creature', 'Flying horror that shields the swarm in toxic winds.'),
('Viper', 'viper.png', 5, 2, 4, 'infected', 'creature', 'A lethal strike that leaves a parasite behind.'),
('The Thing', 'theThing.png', 0, 0, 0, 'infected', 'leader', 'A shapeless entity, the swarm''s beginning. Adaptation is its only identity.'),
('Queen', 'queen.png', 0, 0, 3, 'infected', 'leader', 'Central to the hive, her presence emboldens the swarm.'),
('Overlord', 'overlord.png', 0, 0, 3, 'infected', 'leader', 'The silent watcher, reinforcing the swarm''s unity through will alone.'),
('Viral Bloom', 'viralBloom.png', 0, 0, 2, 'infected', 'spell', 'A sudden eruption of mutagens weakens the enemy from within.'),
('Spinal Reforge', 'spinalReforge.png', 0, 0, 3, 'infected', 'spell', 'Bone twists. Flesh screams. The swarm grows stronger.'),
('Rupture Howl', 'ruptureHowl.png', 0, 0, 1, 'infected', 'spell', 'An adrenaline surge that ends in brutal decay.'),
('Neural Infestation', 'neutralInfestation.png', 0, 0, 4, 'infected', 'spell', 'The mind is just another host. Use it.'),
('Rapid Molt', 'rapitMolt.png', 0, 0, 1, 'infected', 'spell', 'A quick evolution spurred by battlefield necessity.'),
('Flesh Amalgam', 'fleshAmalgam.png', 0, 0, 3, 'infected', 'spell', 'Fusion through grotesque unity. One body, two minds.'),
('Spore Matrix', 'sporeMatrix.png', 0, 0, 4, 'infected', 'spell', 'A healing fog that nurtures flesh and festers enemies.'),
('Corpse Rebirth', 'corpseRebirth.png', 0, 0, 3, 'infected', 'spell', 'Death is only the beginning. The swarm never truly dies.')
ON DUPLICATE KEY UPDATE
                     image_url = VALUES(image_url),
                     attack = VALUES(attack),
                     defense = VALUES(defense),
                     cost = VALUES(cost),
                     team_type = VALUES(team_type),
                     card_type = VALUES(card_type),
                     description = VALUES(description)`;

const energyData = `
UPDATE energy_farmers_cards JOIN cards ON energy_farmers_cards.id = cards.id 
SET energy = CASE
WHEN cards.name = 'Nest of Decay' THEN 1
WHEN cards.name = 'Spores urge' THEN 2
END,
penalty = CASE
WHEN cards.name = 'Nest of Decay' THEN 0
WHEN cards.name = 'Spores urge' THEN 2
END
`

const leaderData = `
UPDATE leaders_cards JOIN cards ON leaders_cards.id = cards.id 
SET bonus_type = CASE
WHEN cards.name = 'Queen' THEN 'attack'
WHEN cards.name = 'Overlord' THEN 'defence'
END,
bonus_value = CASE
WHEN cards.name = 'Queen' THEN 2
WHEN cards.name = 'Overlord' THEN 3
END
`

const spellData = `
UPDATE spells_cards JOIN cards ON spells_cards.id = cards.id 
SET effect = CASE
WHEN cards.name = 'Rupture Howl' THEN 'Target creature gains +3 ATK. It dies at the end of your next turn.'
WHEN cards.name = 'Viral Bloom' THEN 'Target enemy creature gets -2 ATK / -2 DEF.'
WHEN cards.name = 'Spinal Reforge' THEN 'Buff target friendly creature: +2 ATK / +2 DEF and gains "Infect".'
WHEN cards.name = 'Neural Infestation' THEN 'Temporarily control enemy leader for one turn.'
WHEN cards.name = 'Rapid Molt' THEN 'Target creature gains +1 ATK / +1 DEF.'
WHEN cards.name = 'Flesh Amalgam' THEN 'Merge two friendly creatures into one. Combines ATK, DEF, and abilities.'
WHEN cards.name = 'Spore Matrix' THEN 'Player gains +1 HP regeneration per turn.'
WHEN cards.name = 'Corpse Rebirth' THEN 'Revive your last dead creature. It returns with the "Infect" trait.'
END
`
// for now creatures don't have any special abilities

// const creaturesData = `
// UPDATE creatures_card JOIN cards ON creatures_card.id = cards.id
// SET special_ability = CASE
// WHEN cards.name = '...' THEN '...'
// END
// `

module.exports = {cardsData, energyData, leaderData, spellData};*/


// Simple card data with quantities for deck building
const cardsData = `
INSERT INTO cards (name, image_url, attack, defense, cost, team_type, card_type, description, deck_quantity) VALUES

-- SURVIVORS CARDS --
-- Energy Farmers (2 types)
('survivor_energy_1', 'survivor_energy_1.png', 0, 0, 2, 'survivors', 'energy_farmer', 'Basic energy generator for survivors', 4),
('survivor_energy_2', 'survivor_energy_2.png', 0, 0, 3, 'survivors', 'energy_farmer', 'Advanced energy generator for survivors', 1),

-- Leaders (3 types, 1 each)
('survivor_leader_1', 'survivor_leader_1.png', 0, 0, 0, 'survivors', 'leader', 'Commander - Boosts attack of all creatures', 1),
('survivor_leader_2', 'survivor_leader_2.png', 0, 0, 0, 'survivors', 'leader', 'Defender - Boosts defense of all creatures', 1),
('survivor_leader_3', 'survivor_leader_3.png', 0, 0, 0, 'survivors', 'leader', 'Strategist - Draws extra cards', 1),

-- Creatures (5 types, 10 each)
('survivor_creature_1', 'survivor_creature_1.png', 3, 2, 2, 'survivors', 'creature', 'Basic soldier with balanced stats', 10),
('survivor_creature_2', 'survivor_creature_2.png', 5, 1, 3, 'survivors', 'creature', 'Fast attacker with low defense', 10),
('survivor_creature_3', 'survivor_creature_3.png', 2, 4, 3, 'survivors', 'creature', 'Heavy defender with high health', 10),
('survivor_creature_4', 'survivor_creature_4.png', 4, 3, 4, 'survivors', 'creature', 'Elite warrior with good stats', 10),
('survivor_creature_5', 'survivor_creature_5.png', 1, 1, 1, 'survivors', 'creature', 'Cheap unit for early game', 10),

-- Spells (10 types, 2 each)
('survivor_spell_1', 'survivor_spell_1.png', 0, 0, 1, 'survivors', 'spell', 'Heal target creature +2 health', 2),
('survivor_spell_2', 'survivor_spell_2.png', 0, 0, 2, 'survivors', 'spell', 'Give creature +2 attack this turn', 2),
('survivor_spell_3', 'survivor_spell_3.png', 0, 0, 2, 'survivors', 'spell', 'Give creature +2 defense permanently', 2),
('survivor_spell_4', 'survivor_spell_4.png', 0, 0, 3, 'survivors', 'spell', 'Draw 2 cards', 2),
('survivor_spell_5', 'survivor_spell_5.png', 0, 0, 1, 'survivors', 'spell', 'Deal 2 damage to any target', 2),
('survivor_spell_6', 'survivor_spell_6.png', 0, 0, 4, 'survivors', 'spell', 'Destroy target creature', 2),
('survivor_spell_7', 'survivor_spell_7.png', 0, 0, 3, 'survivors', 'spell', 'Gain +2 energy this turn', 2),
('survivor_spell_8', 'survivor_spell_8.png', 0, 0, 2, 'survivors', 'spell', 'Return creature to hand', 2),
('survivor_spell_9', 'survivor_spell_9.png', 0, 0, 1, 'survivors', 'spell', 'Look at top 3 cards, keep 1', 2),
('survivor_spell_10', 'survivor_spell_10.png', 0, 0, 5, 'survivors', 'spell', 'Revive creature from discard', 2),

-- INFECTED CARDS --
-- Energy Farmers (2 types)
('infected_energy_1', 'infected_energy_1.png', 0, 0, 2, 'infected', 'energy_farmer', 'Spawning pool - generates energy', 4),
('infected_energy_2', 'infected_energy_2.png', 0, 0, 4, 'infected', 'energy_farmer', 'Hive mind - powerful but costly energy', 1),

-- Leaders (3 types, 1 each)
('infected_leader_1', 'infected_leader_1.png', 0, 0, 0, 'infected', 'leader', 'Brood Mother - Spawns extra creatures', 1),
('infected_leader_2', 'infected_leader_2.png', 0, 0, 0, 'infected', 'leader', 'Plague Lord - Spreads infection', 1),
('infected_leader_3', 'infected_leader_3.png', 0, 0, 0, 'infected', 'leader', 'Hive Mind - Controls enemy creatures', 1),

-- Creatures (5 types, 10 each)
('infected_creature_1', 'infected_creature_1.png', 2, 1, 1, 'infected', 'creature', 'Parasite - weak but cheap', 10),
('infected_creature_2', 'infected_creature_2.png', 4, 2, 3, 'infected', 'creature', 'Mutant - aggressive attacker', 10),
('infected_creature_3', 'infected_creature_3.png', 1, 5, 4, 'infected', 'creature', 'Blocker - defensive wall', 10),
('infected_creature_4', 'infected_creature_4.png', 3, 3, 3, 'infected', 'creature', 'Hybrid - balanced infected unit', 10),
('infected_creature_5', 'infected_creature_5.png', 6, 1, 5, 'infected', 'creature', 'Alpha - powerful but expensive', 10),

-- Spells (10 types, 2 each)
('infected_spell_1', 'infected_spell_1.png', 0, 0, 1, 'infected', 'spell', 'Infect - convert enemy creature', 2),
('infected_spell_2', 'infected_spell_2.png', 0, 0, 2, 'infected', 'spell', 'Mutation - +1/+1 to all creatures', 2),
('infected_spell_3', 'infected_spell_3.png', 0, 0, 1, 'infected', 'spell', 'Viral spread - deal 1 damage to all enemies', 2),
('infected_spell_4', 'infected_spell_4.png', 0, 0, 3, 'infected', 'spell', 'Regenerate - heal all creatures', 2),
('infected_spell_5', 'infected_spell_5.png', 0, 0, 2, 'infected', 'spell', 'Swarm - summon 2 parasites', 2),
('infected_spell_6', 'infected_spell_6.png', 0, 0, 4, 'infected', 'spell', 'Evolution - transform creature', 2),
('infected_spell_7', 'infected_spell_7.png', 0, 0, 1, 'infected', 'spell', 'Corruption - reduce enemy stats', 2),
('infected_spell_8', 'infected_spell_8.png', 0, 0, 3, 'infected', 'spell', 'Hive call - draw cards equal to creatures', 2),
('infected_spell_9', 'infected_spell_9.png', 0, 0, 2, 'infected', 'spell', 'Plague - destroy weakest enemy', 2),
('infected_spell_10', 'infected_spell_10.png', 0, 0, 5, 'infected', 'spell', 'Apocalypse - destroy all creatures', 2)

ON DUPLICATE KEY UPDATE
    image_url = VALUES(image_url),
    attack = VALUES(attack),
    defense = VALUES(defense),
    cost = VALUES(cost),
    team_type = VALUES(team_type),
    card_type = VALUES(card_type),
    description = VALUES(description),
    deck_quantity = VALUES(deck_quantity)`;

module.exports = { cardsData };