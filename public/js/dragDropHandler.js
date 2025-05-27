
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
  