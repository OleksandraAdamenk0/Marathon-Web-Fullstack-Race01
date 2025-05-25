const cardsData = `
INSERT INTO cards (name, image_url, attack, defense, cost, team_type, card_type, description) VALUES
('goodGuy1', 'card0.png', 5, 4, 6, 'survivors', 'creature', 'A good guy'),
('goodGuy2', 'card2.png', 4, 3, 7, 'survivors', 'creature', 'A good guy'),
('goodGuy3', 'card3.png', 6, 2, 6, 'survivors', 'creature', 'A good guy'),
('goodGuy4', 'card1.png', 7, 3, 5, 'survivors', 'creature', 'A good guy'),
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

module.exports = {cardsData, energyData, leaderData, spellData};