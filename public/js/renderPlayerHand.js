export function renderPlayerHand(hand) {
    const playerRow = document.querySelector('.player-row');
    if (!playerRow) return console.warn('[Render] No .player-row element found');

    if (!Array.isArray(hand)) {
        console.error('[Render] Expected hand to be an array, got:', hand);
        return;
    }

    const placeholder = playerRow.querySelector('.placeholder');
    playerRow.innerHTML = '';
    if (placeholder) playerRow.appendChild(placeholder);

    console.log('[Debug] Rendering hand:', hand);

    hand.forEach((card, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'player-hand';

        const cardImg = document.createElement('img');
        const imagePath = card.imageUrl.startsWith('/')
            ? card.imageUrl
            : `/images/cards/${card.teamType}/${card.imageUrl}`;

        cardImg.src = imagePath;
        cardImg.alt = card.name;
        cardImg.className = 'card player-hand-card';
        cardImg.id = `player-card${index + 1}`;
        cardImg.title = card.description;

        // ✅ Required for drag to work
        cardImg.draggable = true;
        cardImg.dataset.cardId = card.cardId;
        cardImg.dataset.instanceNumber = card.instanceNumber;
        cardImg.dataset.playerCardId = card.id;
        cardImg.dataset.zone = card.zone;

        // ✅ Actual dragstart logic
        cardImg.addEventListener('dragstart', (e) => {
            console.log(`[Drag] Started dragging card ${card.name} (${card.cardId})`);
            e.dataTransfer.setData('text/plain', JSON.stringify({
                cardId: card.cardId
            }));
        });

        cardImg.onerror = () => {
            console.warn(`[Missing Image] ${cardImg.src}`);
            cardImg.src = '/images/cards/default-card.png';
        };

        cardContainer.appendChild(cardImg);
        playerRow.appendChild(cardContainer);
    });
}


export function renderEnemyHand(cardCount = 5, teamType = 'survivors') {
    const enemyRow = document.querySelector('.enemy-row');
    if (!enemyRow) return;

    // Clear old hand cards
    const oldCards = enemyRow.querySelectorAll('.enemy-hand-card');
    oldCards.forEach(el => el.remove());

    const backImage = teamType === 'infected'
        ? '/images/cards/backsides/infects.png'
        : '/images/cards/backsides/people.png';

    for (let i = 1; i <= cardCount; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'enemy-hand-card';

        const img = document.createElement('img');
        img.src = backImage;
        img.alt = 'enemy card back';
        img.className = 'card';
        img.id = `enemy-card${i}`;

        wrapper.appendChild(img);
        enemyRow.appendChild(wrapper);
    }
}

export function renderDeckBackside(teamType = 'survivors') {
    const deckImage = document.querySelector('.active-deck img');
    if (!deckImage) return console.warn('[Render] No deck image found');

    const backImage = teamType === 'infected'
        ? '/images/cards/backsides/infects.png'
        : '/images/cards/backsides/people.png';

    deckImage.src = backImage;
    deckImage.alt = `${teamType} deck`;
}

export function renderPlayerBoard(boardState) {
    // Clear all board/farm/leader slots
    document.querySelectorAll('.player-troop, .player-farmer, .player-leader').forEach(zone => {
      zone.innerHTML = '';
    });
  
    // Group cards by zone
    boardState.forEach(card => {
      if (card.zone !== 'board' && card.zone !== 'farm' && card.zone !== 'leader') return;
  
      const img = document.createElement('img');
      img.src = card.image_url.startsWith('/')
        ? card.image_url
        : `/images/cards/${card.team_type}/${card.image_url}`;
      img.alt = card.name;
      img.title = card.description;
      img.className = `card player-${card.zone}-card`;
  
      // Find target zone
      let zone;
      if (card.zone === 'board') {
        const slotId = `player-troop${card.position || 1}`; // fallback position
        zone = document.getElementById(slotId);
      } else if (card.zone === 'farm') {
        zone = document.querySelector('.player-farmer'); // or use position logic
      } else if (card.zone === 'leader') {
        zone = document.querySelector('.player-leader');
      }
  
      if (zone) {
        zone.innerHTML = ''; // clear old content
        zone.appendChild(img);
      }
    });
  }
  