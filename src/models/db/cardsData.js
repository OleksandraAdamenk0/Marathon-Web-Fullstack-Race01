/*
const cardsData = `
INSERT INTO cards (name, image_url, attack, defense, cost, team_type, card_type, description) VALUES
('Arc Reactor', '/images/cards/survivors/Arc_Reactor.png', 0, 0, 0, 'survivors', 'energy_farmer', 'Effect: Generates +1 Energy per turn.'),
('Fusion Beacon', '/images/cards/survivors/Fusion_Beacon.png', 0, 0, 0, 'survivors', 'energy_farmer', 'Effect: Generates +3 Energy per turn. All your units have -1 DEF while activated.'),
('EMP Specialist', '/images/cards/survivors/EMP_specialist.png', 3, 3, 4, 'survivors', 'creature', 'Trained to neutralize threats. Effect: Removes one buff from an enemy unit'),
('Exo Guardian', '/images/cards/survivors/Exo-Guardian.png', 3, 6, 5, 'survivors', 'creature', 'Encased in reinforced alloy and powered by old-world tech, the Guardian holds the line where others break.'),
('Skyranger', '/images/cards/survivors/Skyranger.png', 2, 6, 6, 'survivors', 'creature', 'An armored aerial transport built to endure and support.'),
('Strike Agent', '/images/cards/survivors/Strike_Agent.png', 5, 2, 3, 'survivors', 'creature', 'A precision operative for sudden impact. Light on armor, heavy on aggression'), 
('Wall Trooper', '/images/cards/survivors/Wall_Trooper.png', 2, 3, 2, 'survivors', 'creature', 'Riot-trained and shielded for endurance. They hold the line when others fall, built to weather the infect\'s assault'),
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
('Arc_Reactor', '/images/cards/survivors/Arc_Reactor.png', 0, 0, 0, 'survivors', 'energy_farmer', 'Effect: Generates +1 Energy per turn.', 4),
('Fusion_Beacon', '/images/cards/survivors/Fusion_Beacon.png', 0, 0, 0, 'survivors', 'energy_farmer', 'Effect: Generates +3 Energy per turn. All your units have -1 DEF while activated.', 1),

-- Leaders (3 types, 1 each)
('survivor_leader_1', 'survivor_leader_1.png', 2, 4, 1, 'survivors', 'leader', 'Commander - Boosts attack of all creatures', 1),
('survivor_leader_2', 'survivor_leader_2.png', 4, 6, 6, 'survivors', 'leader', 'Defender - Boosts defense of all creatures', 1),
('survivor_leader_3', 'survivor_leader_3.png', 5, 3, 8, 'survivors', 'leader', 'Strategist - Draws extra cards', 1),

-- Creatures (5 types, 10 each)

('EMP_Specialist', '/images/cards/survivors/EMP_specialist.png', 3, 3, 4, 'survivors', 'creature', 'Trained to neutralize threats. Effect: Removes one buff from an enemy unit', 10),
('Exo_Guardian', '/images/cards/survivors/Exo_Guardian.png', 3, 6, 5, 'survivors', 'creature', 'Encased in reinforced alloy and powered by old-world tech, the Guardian holds the line where others break.', 10),
('Skyranger', '/images/cards/survivors/Skyranger.png', 2, 6, 6, 'survivors', 'creature', 'An armored aerial transport built to endure and support.', 10),
('Strike_Agent', '/images/cards/survivors/Strike_Agent.png', 5, 2, 3, 'survivors', 'creature', 'A precision operative for sudden impact. Light on armor, heavy on aggression', 10), 
('Wall_Trooper', '/images/cards/survivors/Wall_Trooper.png', 2, 3, 2, 'survivors', 'creature', 'Riot-trained and shielded for endurance. They hold the line when others fall, built to weather the infect''s assault', 10),

-- INFECTED CARDS --
-- Energy Farmers (2 types)
('Spore_Surge', '/images/cards/infected/Spore_Surge.png', 0, 0, 0, 'infected', 'energy_farmer', 'Effect: +2 Energy per turn. Deals 1 damage to your core each turn.', 4),
('Nest_of_Decay', '/images/cards/infected/Nest_of_Decay.png', 0, 0, 0, 'infected', 'energy_farmer', 'Effect: Generates +1 Energy per turn.', 1),

-- Leaders (3 types, 1 each)
('infected_leader_1', 'infected_leader_1.png', 3, 2, 1, 'infected', 'leader', 'Brood Mother - Spawns extra creatures', 1),
('infected_leader_2', 'infected_leader_2.png', 3, 5, 5, 'infected', 'leader', 'Plague Lord - Spreads infection', 1),
('infected_leader_3', 'infected_leader_3.png', 4, 3, 7, 'infected', 'leader', 'Hive Mind - Controls enemy creatures', 1),

-- Creatures (5 types, 10 each)
('Gnawling', '/images/cards/infected/Gnawling.png', 1, 1, 1, 'infected', 'creature', 'Minions that would die for the Queen.', 10),
('Infect', '/images/cards/infected/Infected.png', 2, 3, 2, 'infected', 'creature', 'Basic frontline unit used to test enemy lines. Weak but resilient, it survives longer than expected.', 10),
('Mutalisk', '/images/cards/infected/Mutalisk.png', 3, 6, 5, 'infected', 'creature', 'A winged predator fueled by instinct. Effect: On deploy, grants +1 DEF to nearby allies.', 10),
('Ravager', '/images/cards/infected/Ravager.png', 4, 1, 3, 'infected', 'creature', 'A bloated crawler pulsing with corrosive bile. Slow but relentless, able to chew through anything.', 10),
('Viper', '/images/cards/infected/Viper.png', 3, 2, 3, 'infected', 'creature', 'A venomous horror bred for infection. Effect: When Viper kills a unit, infect a random enemy.', 10)


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
