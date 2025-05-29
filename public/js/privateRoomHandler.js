document.addEventListener('DOMContentLoaded', () => {
    const privateButton = document.getElementById('private-room-trigger');
    const modal = document.getElementById("create-password");
  
    if (privateButton) {
      privateButton.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('hidden');
      });
    }
  
    document.getElementById("confirm-password-btn")?.addEventListener("click", async () => {
      const password = document.getElementById("set-password").value;
      const playerId = window.USER_ID;
  
      if (!password) {
        alert('Please enter a room password');
        return;
      }
  
      try {
        const response = await fetch(`/api/room/private/create?json=true`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: password })
          });
  
        const data = await response.json();
        if (data.success && data.redirectTo) {
          window.location.href = data.redirectTo;
        } else {
          alert(data.error || 'Failed to create room');
        }
      } catch (err) {
        console.error('[CreateRoom]', err);
        alert('Server error creating room');
      }
    });
  
    document.getElementById("cancel-password-btn")?.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.getElementById("set-password").value = "";
    });
  });
  