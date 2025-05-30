import { startTurnTimer, stopTurnTimer, resetTurnTimerDisplay } from './turnTimer.js';


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
  const { role, health, energy, opponent, currentTurn } = data;

  window.PLAYER_TEAM_TYPE = role;
  window.CURRENT_TURN_PLAYER = currentTurn;

  renderPlayerStats(health, energy);
  renderOpponentStats(opponent);
});


socket.on('deck-built', ({ hand, deckStats, teamType }) => {
    console.log('[Deck Built]', hand, deckStats, teamType);
    renderPlayerHand(hand, teamType);
    renderEnemyHand(5, teamType === 'infected' ? 'survivors' : 'infected');
    renderDeckBackside(teamType);
});

socket.on('match-initialized', (data) => {
  console.log('[Socket] Match initialized:', data);

  const currentTurn = data.currentTurn;
  window.CURRENT_TURN_PLAYER = currentTurn;

  const isMyTurn = currentTurn.toString() === window.USER_ID.toString();
  window.IS_MY_TURN = isMyTurn;

  console.log(`[TURN] currentPlayer=${currentTurn}, USER_ID=${window.USER_ID}, IS_MY_TURN=${isMyTurn}`);

  resetTurnTimerDisplay();
startTurnTimer(() => {
  if (isMyTurn) {
    console.log('[Timer] Time is up! Emitting end-turn with:', {
      roomId: window.ROOM_ID,
      userId: window.USER_ID
    });
    socket.emit('end-turn', {
      roomId: window.ROOM_ID,
      userId: window.USER_ID
    });
  } else {
    console.log('[Timer] Opponent’s timer ended, ignoring on this client.');
  }
});
});

socket.on('player-joined', async ({ user, socketId }) => {
  console.log('[Client] player-joined received:', user.username, socketId);

  if (p1 && !p1.textContent.includes(user.username)) {
    p1.textContent = user.username;
  } else if (p2 && !p2.textContent.includes(user.username)) {
    p2.textContent = user.username;
  }

  const reloaded = sessionStorage.getItem('alreadyReloaded') === 'true';
  if (!reloaded) {
    console.log('[Client] First join detected, reloading...');
    sessionStorage.setItem('alreadyReloaded', 'true');
    window.location.reload();
  }
});

socket.on('room-update', async ({ roomId }) => {
    if (!window.ROOM_ID || window.ROOM_ID !== roomId.toString()) return;

    try {
      const response = await fetch(`/api/room/${roomId}`);
      const roomData = await response.json();
      console.log('[Room UI] Room data fetched:', roomData);
  
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


  socket.on('turn-started', ({ currentPlayer }) => {
    const isMyTurn = currentPlayer.toString() === window.USER_ID.toString();
    console.log(`[TURN] currentPlayer=${currentPlayer}, USER_ID=${window.USER_ID}, IS_MY_TURN=${isMyTurn}`);
  
    const indicator = document.getElementById('turn-indicator');
    if (!indicator) return;
  
    indicator.style.transform = isMyTurn ? 'rotate(0deg)' : 'rotate(180deg)';
    indicator.title = isMyTurn ? 'Your Turn' : 'Opponent Turn';

    resetTurnTimerDisplay();
    startTurnTimer(() => {
      if (isMyTurn) {
        console.log('[Timer] Time is up! Emitting end-turn with:', {
          roomId: window.ROOM_ID,
          userId: window.USER_ID
        });
        socket.emit('end-turn', {
          roomId: window.ROOM_ID,
          userId: window.USER_ID
        });
      } else {
        console.log('[Timer] Opponent’s timer ended, ignoring on this client.');
      }
    });

      const endTurnBtn = document.getElementById('end-turn-button');
  if (endTurnBtn) {
    endTurnBtn.addEventListener('click', () => {
      if (!window.IS_MY_TURN) {
        console.warn('[End Turn] Not your turn!');
        return;
      }

      console.log('[End Turn] Button clicked. Emitting end-turn with:', {
        roomId: window.ROOM_ID,
        userId: window.USER_ID
      });

      socket.emit('end-turn', {
        roomId: window.ROOM_ID,
        userId: window.USER_ID
      });

      stopTurnTimer();
    });
}


  });
  
  function renderPlayerStats(health, energy) {
    const hpValue = document.getElementById('player-hp-value');
    const energyValue = document.getElementById('player-energy-value');
  
    if (hpValue) {
      hpValue.textContent = `${health}/10`;
    }
  
    if (energyValue) {
      energyValue.textContent = `${energy}/10`;
    }
  }

  function renderOpponentStats(opponent) {
    if (!opponent) return;
  
    const enemyInfo = document.querySelector('.enemy-info');
    if (!enemyInfo) return;
  
    const avatarImg = enemyInfo.querySelector('img.avatar');
    const nameDiv = enemyInfo.querySelector('.player-name');
    const hpSpan = enemyInfo.querySelector('#enemy-hp-value');
  
    if (avatarImg) {
      avatarImg.src = `/${opponent.avatar_url}`;
      avatarImg.title = `Health: ${opponent.health || 10}`;
    }
  
    if (nameDiv) {
      nameDiv.textContent = opponent.username.length > 14
        ? opponent.username.slice(0, 14) + '...'
        : opponent.username;
      nameDiv.title = opponent.username;
    }
  
    if (hpSpan) {
      hpSpan.textContent = `${opponent.health || 10}/10`;
    }
  }
  

  function renderPlayerHand(hand, teamType) {
    const playerRow = document.querySelector('.player-row');
    if (!playerRow) return console.warn('[Render] No .player-row element found');
    if (!Array.isArray(hand)) return console.error('[Render] Expected hand to be an array');
  
    const placeholder = playerRow.querySelector('.placeholder');
    playerRow.querySelectorAll('.player-hand').forEach(el => el.remove());
    if (placeholder && !playerRow.contains(placeholder)) {
      playerRow.appendChild(placeholder);
    }
  
    hand.forEach((card, index) => {
      const handSlot = document.createElement('div');
      handSlot.className = 'player-hand';
      playerRow.appendChild(handSlot);
      const backImage = teamType === 'infected'
  ? '/images/cards/backsides/infects.png'
  : '/images/cards/backsides/people.png';

    

const placeholderImg = document.createElement('img');
placeholderImg.className = 'card player-hand-card';
placeholderImg.src = backImage;
placeholderImg.alt = 'card back';
placeholderImg.style.visibility = 'hidden';
handSlot.appendChild(placeholderImg);
      animateCardToHand(card, index, handSlot, teamType);
    });
  }
  
  function animateCardToHand(card, index, handSlot, teamType) {
    const deck = document.querySelector('.active-deck img');
    if (!deck || !handSlot || !card.image_url) return;
  
    const cardElem = document.createElement('img');
    cardElem.className = 'card player-hand-card';
    const backImage = teamType === 'infected'
  ? '/images/cards/backsides/infects.png'
  : '/images/cards/backsides/people.png';


cardElem.src = backImage;

    cardElem.style.position = 'absolute';
    cardElem.style.left = '0px';
    cardElem.style.top = '0px';
    cardElem.style.width = getComputedStyle(handSlot).width;
    cardElem.style.height = getComputedStyle(handSlot).height;

    cardElem.style.zIndex = 1000;
  
    document.body.appendChild(cardElem);
  
    const deckRect = deck.getBoundingClientRect();
    const handRect = handSlot.getBoundingClientRect();
    const deltaX = handRect.left - deckRect.left;
    const deltaY = handRect.top - deckRect.top;
  
    gsap.set(cardElem, {
      x: deckRect.left + window.scrollX,
      y: deckRect.top + window.scrollY
    });
  
    const frontUrl = card.image_url.startsWith('/')
      ? card.image_url
      : `/images/cards/${teamType}/${card.image_url}`;
  
    const tl = gsap.timeline({
      onComplete: () => {
        cardElem.remove();
        handSlot.innerHTML = '';
      
        const finalCard = document.createElement('img');
        finalCard.src = frontUrl;
        finalCard.className = 'card player-hand-card';
        finalCard.alt = card.name;
        finalCard.title = card.description;
        finalCard.dataset.cardId = card.cardId;
        finalCard.dataset.instanceNumber = card.instanceNumber;
        finalCard.dataset.playerCardId = card.id;
        finalCard.dataset.zone = card.zone;
        finalCard.dataset.cardType = card.card_type;
        finalCard.style.width = '100%';
        finalCard.style.height = '100%';
        finalCard.style.objectFit = 'contain';
        finalCard.style.display = 'block';
        finalCard.style.zIndex = '500';
      


        finalCard.onerror = () => {
          console.warn(`[Missing Image] ${frontUrl}`);
          finalCard.src = '/images/cards/default-card.png';
        };
      
        const cardWrapper = document.createElement('div');
    cardWrapper.className = 'card-wrapper';
    cardWrapper.appendChild(finalCard);

// Cost (top-left)
const costText = document.createElement('div');
costText.className = 'card-cost';
costText.textContent = card.cost;
cardWrapper.appendChild(costText);

// Attack (top-right)
const attackText = document.createElement('div');
attackText.className = 'card-attack';
attackText.textContent = card.attack;
cardWrapper.appendChild(attackText);

// Defense (below attack)
const defenseText = document.createElement('div');
defenseText.className = 'card-defense';
defenseText.textContent = card.defense;
cardWrapper.appendChild(defenseText);

handSlot.appendChild(cardWrapper);

const icon = document.createElement('img');
icon.src = `/images/cards/icons.png`; 
icon.alt = 'card icon';
icon.className = 'card-icon-overlay';

cardWrapper.appendChild(icon);
handSlot.appendChild(cardWrapper);

  finalCard.addEventListener('click', () => {

    if (!window.IS_MY_TURN) {
      console.warn('[PlayCard] Not your turn! Ignoring click.');
      return;
    }
    const cardType = finalCard.dataset.cardType;
    let zoneType = '';
    if (cardType.includes('farmer')) {
      zoneType = 'farm';
    } else if (cardType.includes('leader')) {
      zoneType = 'leader';
    } else if (cardType.includes('creature')) {
      zoneType = 'board';
    } else {
      console.warn('[PlayCard] Unknown card type:', cardType);
      return;
    }
    
    let target = null;

    let occupiedTroopSlots = [false, false, false, false, false]; // indexes 0–4

    function findAvailableTroopSlot() {
      for (let i = 0; i < 5; i++) {
        const slot = document.getElementById(`player-troop${i + 1}`);
        if (slot && slot.children.length === 0 && !occupiedTroopSlots[i]) {
          occupiedTroopSlots[i] = true;
          return slot;
        }
      }
      return null;
    }


    if (zoneType === 'leader') {
      target = document.querySelector('.leader');
    } else if (zoneType === 'farm') {
      target = document.querySelector('.farmers');
    } else if (zoneType === 'board') {
      const troopSlots = document.querySelectorAll('.player-troop');
      target = findAvailableTroopSlot();

    }

    if (!target) {
      console.warn('[PlayCard] No target found for zone:', zoneType);
      return;
    }

    console.log('[PlayCard] IS_MY_TURN:', window.IS_MY_TURN);
    console.log('[PlayCard] Emitting play-card for', finalCard.dataset.playerCardId, 'to', zoneType);


    window.socket.emit('play-card', {
      roomId: window.ROOM_ID,
      userId: window.USER_ID,
      data: {
        cardId: finalCard.dataset.playerCardId,
        destination: zoneType
      }
    });
    handSlot.innerHTML = '';
  });
}


      
    });
  
    tl.to(cardElem, {
      duration: 0.8,
      x: `+=${deltaX}`,
      y: `+=${deltaY}`,
      ease: 'power2.out'
    })
    .to(cardElem, {
      duration: 0.3,
      scaleX: 0,
      ease: 'power1.inOut'
    }, teamType === 'infected' ? '+=0.05' : '+=0.1')
    .set(cardElem, {
      scaleX: 0,
      src: frontUrl
    })
    .to(cardElem, {
      duration: 0.3,
      scaleX: 1,
      ease: 'power1.inOut'
    });
  }
  
  socket.on('turn-started', ({ currentPlayer }) => {
    console.log('[TURN-STARTED EVENT] Received from server. currentPlayer =', currentPlayer);

  window.CURRENT_TURN_PLAYER = currentPlayer;
  const isMyTurn = currentPlayer.toString() === window.USER_ID.toString();
  window.IS_MY_TURN = isMyTurn;

    const indicator = document.getElementById('turn-indicator');
    if (!indicator) return;
  
    
    indicator.style.transform = isMyTurn ? 'rotate(0deg)' : 'rotate(180deg)';
    indicator.title = isMyTurn ? 'Your Turn' : 'Opponent Turn';
  });


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
  document.querySelectorAll('.player-troop, .enemy-troop, .farmers, .leader').forEach(zone => {
    zone.innerHTML = '';
  });

  const myId = window.USER_ID?.toString();

  boardState.forEach(card => {
    if (!['board', 'farm', 'leader'].includes(card.zone)) return;

    const isMine = card.user_id?.toString() === myId;
    let zone;

    if (card.zone === 'board') {
      const slotId = isMine ? `player-troop${card.position || 1}` : `enemy-troop${card.position || 1}`;
      zone = document.getElementById(slotId);
    } else if (card.zone === 'farm') {
      zone = isMine ? document.querySelector('.farmers') : null;
    } else if (card.zone === 'leader') {
      zone = isMine ? document.querySelector('.leader') : null;
    }

    if (!zone) return;

    // Create card wrapper and content like before
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'card-wrapper';

    const img = document.createElement('img');
    img.src = card.image_url.startsWith('/')
      ? card.image_url
      : `/images/cards/${card.team_type}/${card.image_url}`;
    img.alt = card.name;
    img.title = card.description;
    img.className = `card ${isMine ? 'player-' : 'enemy-'}${card.zone}-card`;
    img.dataset.cardId = card.cardId;
    img.dataset.cardType = card.card_type;

    cardWrapper.appendChild(img);

    const costText = document.createElement('div');
    costText.className = 'card-cost';
    costText.textContent = card.cost;
    cardWrapper.appendChild(costText);

    const attackText = document.createElement('div');
    attackText.className = 'card-attack';
    attackText.textContent = card.attack;
    cardWrapper.appendChild(attackText);

    const defenseText = document.createElement('div');
    defenseText.className = 'card-defense';
    defenseText.textContent = card.defense;
    cardWrapper.appendChild(defenseText);

    const icon = document.createElement('img');
    icon.src = `/images/cards/icons.png`;
    icon.alt = 'card icon';
    icon.className = 'card-icon-overlay';
    cardWrapper.appendChild(icon);

    zone.innerHTML = '';
    zone.appendChild(cardWrapper);
  });
}


  
  async function fetchAndRenderGameState(roomId) {
    console.log('[Reload] Starting fetchAndRenderGameState()');
    if (!roomId) {
      console.warn('[Reload] Missing roomId');
      return;
    }
    
  
    try {
      const response = await fetch(`/api/game/get-hand-and-board?room_id=${roomId}`, {
        credentials: 'include'
      });
      const data = await response.json();
  
      console.log('[Reload] Server responded:', data);
  
      if (data.hand && data.boardState) {
        console.log('[Client] Reloaded hand and board from server');
        

        const teamType = window.PLAYER_TEAM_TYPE || 'survivors';
        const opponentTeam = teamType === 'infected' ? 'survivors' : 'infected';
        renderPlayerHand(data.hand, teamType);
        renderPlayerBoard(data.boardState);
        renderEnemyHand(5, opponentTeam);
        renderDeckBackside(teamType);

      } else {
        console.warn('[Client] Missing data from server:', data);
      }
    } catch (err) {
      console.error('[Client] Failed to reload game state:', err);
    }
  }

  let lastHandSnapshot = [];

  window.socket.on('hand-update', ({ hand }) => {
    const teamType = window.PLAYER_TEAM_TYPE || 'survivors';
  
    // Skip if hand is same as last render
    const handIds = hand.map(c => c.id).join(',');
    const lastIds = lastHandSnapshot.map(c => c.id).join(',');
    if (handIds === lastIds) {
      console.log('[Client] Hand unchanged, skipping render.');
      return;
    }
  
    lastHandSnapshot = hand; // Update snapshot
    console.log('[Client] Hand updated');
    renderPlayerHand(hand, teamType);
  });
  
  
    window.socket.on('board-update', ({ board }) => {
      console.log('[Client] Board updated');
      renderPlayerBoard(board);
    });
  
    window.socket.on('turn-error', ({ reason }) => {
      alert(`Card move failed: ${reason}`);
    });

  