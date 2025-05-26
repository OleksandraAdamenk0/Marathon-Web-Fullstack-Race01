document.addEventListener('DOMContentLoaded', () => {
  const reloadBtn = document.getElementById('reload-rooms-btn');
  const overlay = document.getElementById('room-loading-overlay');

  if (reloadBtn && overlay) {
    reloadBtn.addEventListener('click', async () => {
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
          row.innerHTML = `<td colspan="4" style="text-align: center; padding: 80px 0; color: rgba(255, 255, 255, 0.7); font-style: italic;  padding: 100px 0;">It is weirdly quiet here today...</td>`;
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
              <form action="/api/room/join/${room.id}" method="POST">
                <input type="hidden" name="code" value="00005">
                <button class="join-button" type="submit" ${isFull ? 'disabled' : ''}>Join</button>
              </form>
            </td>
          `;
          tbody.appendChild(row);
        });

      } catch (err) {
        console.error('[Room Reload Error]', err);
        alert('Failed to reload rooms.');
      } finally {
        setTimeout(() => overlay.style.display = 'none', 500);
      }
    });
  }

  setTimeout(() => {
    const overlay = document.getElementById('room-loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }, 1000);
});
