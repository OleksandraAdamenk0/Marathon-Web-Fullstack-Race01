document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('room-loading-overlay');
    const reloadBtn = document.getElementById('reload-rooms-btn');
  
    // Show overlay briefly on any page load
    if (overlay) {
      overlay.style.display = 'flex';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 800); // duration of "Loading..." screen
    }
  
    // Reload on button click (optional, cleaner reload)
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        location.reload();
      });
    }
  });
  