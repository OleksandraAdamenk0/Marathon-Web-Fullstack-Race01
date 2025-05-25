const cardsData = [
    {
        name: '🕷️ Nest of Decay',
        citation: '"PFFFSSHHHHKHH... moist growth noises...PFFFSSHHHHKHH"',
        author: 'The Nest, merging with the rot',
        description: 'A breathing mound of bile and bones, the Nest of Decay pulses with a rhythm older than life. Deep within, twisted larvae wriggle in filth, waiting for the call to swarm. It\'s not just a structure — it’s an ecosystem of horror. And it brings power.',
    },
    {
        name: '🎖️ Field Commander',
        citation: '"I don’t just lead troops. I forge them into legends."',
        author: 'Field Commander',
        description: 'Every scar tells a story — and the Field Commander bears many. Trained in a hundred campaigns, he’s the mind behind the tactics and the steel behind the charge. When he enters the battlefield, even green recruits strike like veterans. And when he raises his banner, the army becomes unstoppable.',
    },
    {
        name: '👑 The Queen',
        citation: '“She doesn’t speak. She doesn’t need to. The chittering screams do the talking.”',
        author: 'Last words found etched on a bunker wall',
        description: 'In the heart of the hive, she reigns — ancient, cruel, and revered. The Queen is more than a leader; she’s a force of nature. Her screech echoes across the field, awakening legions of slavering beasts from beneath the soil. When she rises, her children rise with her.'
    },
    {
        name: '🛡️ Skyranger',
        citation: '"When the skies rain fire, it flies straight into the storm."',
        author: 'Unknown Commander, Battle of the Burning Spires',
        description: 'Forged in the floating citadels of the Northern Reaches, the Skyranger is an armored aerial beast of burden — not for cargo, but for war. Its reinforced hull shrugs off anti-air fire, and its rotating turrets cover the battlefield like a guardian angel. Wherever it lands, the troops rally stronger behind its shadow.',
    }]

document.addEventListener( 'DOMContentLoaded', () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    console.log(document.getElementById('citation-author'))

    const cards = Array.from(document.querySelectorAll('.game-card'));

    cards.forEach(card => {
        card.addEventListener('click', () => cardClickHandler(cards, card));
    });
})

function cardClickHandler(cards, card = this) {
    const index = parseInt(card.dataset.index);
    if (index === cards.length - 1) return;

    const clicked = cards.splice(index, 1)[0];
    cards.push(clicked);

    cards.forEach((c, i) => {
        c.dataset.index = i;
        if (i === cards.length - 1) {
            c.classList.add('top-card');
        } else {
            c.classList.remove('top-card');
        }
    });
    changeCardInfo(card.firstElementChild.dataset.index);
}

function changeCardInfo(i) {
    document.getElementById("card-name").textContent = cardsData[i].name;
    document.getElementById('citation-author').textContent = cardsData[i].author;
    document.querySelector('.citation').textContent = cardsData[i].citation;
    document.getElementById("card-description").textContent = cardsData[i].description;
}