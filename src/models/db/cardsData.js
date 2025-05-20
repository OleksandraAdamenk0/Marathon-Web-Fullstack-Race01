const data = `
INSERT INTO cards (name, image_url, attack, defense, heal, cost, type) VALUES
('goodGuy1', 'card1.png', 5, 4, 6, 150, 'survival'),
('goodGuy2', 'card2.png', 4, 3, 7, 135, 'survival'),
('goodGuy3', 'card3.png', 6, 2, 6, 140, 'survival'),
('goodGuy4', 'card.png', 7, 3, 5, 160, 'survival'),
('goodGuy5', 'card5.png', 3, 4, 8, 145, 'survival'),
('goodGuy6', 'card6.png', 5, 5, 5, 150, 'survival'),
('goodGuy7', 'card7.png', 4, 6, 5, 155, 'survival'),
('goodGuy8', 'card8.png', 2, 5, 8, 140, 'survival'),
('goodGuy9', 'card9.png', 6, 5, 4, 160, 'survival'),
('goodGuy10', 'card10.png', 4, 4, 7, 145, 'survival'),
('badGuy1', 'card11.png', 7, 2, 5, 140, 'infected'),
('badGuy2', 'card12.png', 6, 1, 6, 130, 'infected'),
('badGuy3', 'card13.png', 8, 3, 4, 170, 'infected'),
('badGuy4', 'card14.png', 5, 3, 7, 150, 'infected'),
('badGuy5', 'card15.png', 4, 2, 9, 145, 'infected'),
('badGuy6', 'card16.png', 6, 4, 6, 170, 'infected'),
('badGuy7', 'card17.png', 7, 3, 5, 155, 'infected'),
('badGuy8', 'card18.png', 3, 3, 8, 135, 'infected'),
('badGuy9', 'card19.png', 9, 4, 5, 190, 'infected'),
('badGuy10', 'card20.png', 5, 4, 6, 150, 'infected')
ON DUPLICATE KEY UPDATE
                     image_url = VALUES(image_url),
                     attack = VALUES(attack),
                     defense = VALUES(defense),
                     heal = VALUES(heal),
                     cost = VALUES(cost),
                     type = VALUES(type);
`;

module.exports = data;