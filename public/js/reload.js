import socket from './socket.js';

document.addEventListener('DOMContentLoaded', () => {
  const reloadBtn = document.getElementById('reload-rooms-btn');
  const overlay = document.getElementById('room-loading-overlay');

  async function reloadRooms() {
    if (!overlay) return;
    overlay.style.display = 'flex';

    try {
      const response = await fetch('/api/room/public/available', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });

      const data = await response.json();
      const rooms = data.rooms || data.roomsData || [];

      const tbody = document.querySelector('.room-table tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (rooms.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" style="text-align: center; padding: 100px 0; color: rgba(255, 255, 255, 0.7); font-style: italic;">It is weirdly quiet here today...</td>`;
        tbody.appendChild(row);
        return;
      }

      rooms.filter(room => room.status !== 'finished').forEach((room, index) => {
        const players = room.player_two_id ? 2 : 1;
        const isFull = players === 2;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            ${room.code ? "<box-icon type='solid' name='lock-alt' size='1em' color='white'></box-icon>" : ''}
            #${index + 1}
          </td>
          <td>${room.status}</td>
          <td>${players} / 2</td>
          <td>
            <button class="join-button" data-room-id="${room.id}" data-is-private="${room.code ? 'true' : 'false'}" ${isFull ? 'disabled' : ''}>
              Join
            </button>

          </td>
        `;
        tbody.appendChild(row);
      });

      document.querySelectorAll('.join-button').forEach(button => {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          const roomId = button.dataset.roomId;
          const isPrivate = button.dataset.isPrivate === 'true';
      
          if (isPrivate) {
            const modal = document.getElementById('enter-password');
            modal.classList.remove('hidden');
      
            document.getElementById('submit-password-btn').onclick = () => {
              const password = document.getElementById('join-password').value;
              if (!password) return alert('Please enter a password.');
      
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = `/api/room/join/${roomId}`;
      
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'code';
              input.value = password;
      
              form.appendChild(input);
              document.body.appendChild(form);
              form.submit();
            };
      
            document.getElementById('cancel-join-btn').onclick = () => {
              modal.classList.add('hidden');
              document.getElementById('join-password').value = '';
            };
      
          } else {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/api/room/join/${roomId}`;
            document.body.appendChild(form);
            form.submit();
          }
        });
      });      

    } catch (err) {
      console.error('[Room Reload Error]', err);
      alert('Failed to reload rooms.');
    } finally {
      setTimeout(() => {
        if (overlay) overlay.style.display = 'none';
      }, 500);
    }
  }

  if (reloadBtn) {
    reloadBtn.addEventListener('click', reloadRooms);
  }

  setTimeout(() => {
    try {
      if (overlay) overlay.style.display = 'none';
    } catch (e) {
      console.warn('[Overlay fallback] Error hiding overlay:', e);
    }
  }, 1000);

  socket.on('room-created', () => {
    console.log('[Socket] New room created, reloading list');
    reloadRooms();
  });
});
