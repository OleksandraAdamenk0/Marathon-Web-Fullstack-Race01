if (!sessionStorage.getItem('alreadyReloaded')) {
  sessionStorage.setItem('alreadyReloaded', 'false');
}

socket.on('connect', () => {
  const roomId = window.ROOM_ID;
  const userId = window.USER_ID;
  const username = window.USERNAME;

  if (roomId && userId && username) {
    socket.emit('join-room', {
      roomId,
      user: { id: userId, username }
    });
    console.log(`[Socket] Sent join-room for room ${roomId}`);

    socket.emit('start-game', { roomId, userId });

    console.log('[Client] Sent start-game', { roomId, userId });
  } else {
    console.warn('[Socket] Missing ROOM_ID or USER_ID on connect');


  }

});

socket.on('role-assigned', (data) => {
  console.log('[Client] Role assigned:', data);
  window.PLAYER_TEAM_TYPE = data.role;
});

socket.on('game-already-started', (data) => {
  console.log('[Client] Game already started:', data);
  if (!data.role || !data.opponent) {
    console.warn('Missing data keys:', data);
  } else {
    window.PLAYER_TEAM_TYPE = data.role;
  }
});

socket.on('deck-built', ({ hand, deckStats, teamType }) => {
    console.log('[Deck Built]', hand, deckStats, teamType);
    renderPlayerHand(hand);
    renderEnemyHand(5, teamType === 'infected' ? 'survivors' : 'infected');
    renderDeckBackside(teamType);
});


socket.on('room-update', async ({ roomId }) => {
    if (!window.ROOM_ID || window.ROOM_ID !== roomId.toString()) return;

    try {
      const response = await fetch(`/api/room/${roomId}`);
      const roomData = await response.json();
      console.log('[Room UI] Room data fetched:', roomData);
      const p1 = document.getElementById('player1-name');
      const p2 = document.getElementById('player2-name');
  
      if (p1) p1.textContent = roomData.player1?.username || 'Waiting...';
      if (p2) p2.textContent = roomData.player2?.username || 'Waiting...';
  
      const isPlayer1 = roomData.player1?.id?.toString() === window.USER_ID?.toString();
      const bothPlayersPresent = roomData.player1 && roomData.player2;
      const reloaded = sessionStorage.getItem('alreadyReloaded') === 'true';
  
      if (isPlayer1 && bothPlayersPresent && !reloaded) {
        console.log('[Room UI] Player 1 sees both players. Reloading once...');
        sessionStorage.setItem('alreadyReloaded', 'true');
        window.location.reload();
      }

      setTimeout(() => fetchAndRenderGameState(roomId), 500);
  
    } catch (err) {
      console.error('[Room UI] Failed to reload room UI:', err);
    }
  });

function renderPlayerHand(hand) {
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
        if (!card.image_url) {
          console.warn('[Render] Card is missing image_url:', card);
          return;
        }
        
        const imagePath = card.image_url.startsWith('/')
            ? card.image_url
            : `/images/cards/${card.team_type}/${card.image_url}`;


        cardImg.src = imagePath;
        cardImg.alt = card.name;
        cardImg.className = 'card player-hand-card';
        cardImg.id = `player-card${index + 1}`;
        cardImg.title = card.description;

        cardImg.draggable = true;
        cardImg.dataset.cardId = card.cardId;
        cardImg.dataset.instanceNumber = card.instanceNumber;
        cardImg.dataset.playerCardId = card.id;
        cardImg.dataset.zone = card.zone;

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


function renderEnemyHand(cardCount = 5, teamType = 'survivors') {
    const enemyRow = document.querySelector('.enemy-row');
    if (!enemyRow) return;

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

function renderDeckBackside(teamType = 'survivors') {
    const deckImage = document.querySelector('.active-deck img');
    if (!deckImage) return console.warn('[Render] No deck image found');

    const backImage = teamType === 'infected'
        ? '/images/cards/backsides/infects.png'
        : '/images/cards/backsides/people.png';

    deckImage.src = backImage;
    deckImage.alt = `${teamType} deck`;
}

function renderPlayerBoard(boardState) {
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
  
  async function fetchAndRenderGameState(roomId) {
    console.log('[Reload] Starting fetchAndRenderGameState()');
    if (!roomId) {
      console.warn('[Reload] Missing roomId');
      return;
    }
    
  
    try {
      const response = await fetch(`/api/game/get-hand-and-board?room_id=${roomId}`);
      const data = await response.json();
  
      console.log('[Reload] Server responded:', data);
  
      if (data.hand && data.boardState) {
        console.log('[Client] Reloaded hand and board from server');
        renderPlayerHand(data.hand);
        renderPlayerBoard(data.boardState);
        const teamType = window.PLAYER_TEAM_TYPE || 'survivors';
const opponentTeam = teamType === 'infected' ? 'survivors' : 'infected';
renderEnemyHand(5, opponentTeam);
renderDeckBackside(teamType);

      } else {
        console.warn('[Client] Missing data from server:', data);
      }
    } catch (err) {
      console.error('[Client] Failed to reload game state:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Enable drag on hand cards
    document.querySelectorAll('.player-hand-card').forEach(card => {
      card.draggable = true;
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          cardId: card.dataset.cardId // Important: use cardId, not playerCardId
        }));
      });
    });
  
    // Enable drop on zones
    document.querySelectorAll('.player-troop, .player-farmer, .player-leader').forEach(zone => {
      zone.addEventListener('dragover', (e) => e.preventDefault());
  
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const { cardId } = JSON.parse(e.dataTransfer.getData('text/plain'));
        const destination = getZoneFromElement(zone);
  
        const payload = {
          roomId: window.ROOM_ID,
          userId: window.USER_ID,
          data: {
            cardId,
            destination
          }
        };
  
        window.socket.emit('play-card', payload);
      });
    });
  
    // Server responses
    window.socket.on('hand-update', ({ hand }) => {
      console.log('[Client] Hand updated');
      renderPlayerHand(hand); // Make sure this is imported
    });
  
    window.socket.on('board-update', ({ board }) => {
      console.log('[Client] Board updated');
      ///renderPlayerBoard(board); // You need to implement this if not yet
    });
  
    window.socket.on('turn-error', ({ reason }) => {
      alert(`Card move failed: ${reason}`);
    });
  });
  
  function getZoneFromElement(el) {
    if (el.classList.contains('player-troop')) return 'board';
    if (el.classList.contains('player-farmer')) return 'farm';
    if (el.classList.contains('player-leader')) return 'leader';
    return null;
  }
  