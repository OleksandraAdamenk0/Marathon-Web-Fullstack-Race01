
export async function initPublicQuickJoin(socket) {
    const btn = document.getElementById('joinPublicBtn');
    if (!btn) return;

    btn.addEventListener('click', async e => {
        e.preventDefault();
        btn.disabled = true;
        try {

            let resp = await fetch('/api/room/public/available?json=true');
            let { roomId } = await resp.json();


            let joinOrCreate = roomId
                ? `/api/room/join/${roomId}?json=true`
                : `/api/room/public/create?json=true`;

            resp = await fetch(joinOrCreate, { method: 'POST' });
            let data = await resp.json();
            if (!data.roomId) throw new Error('No room returned');


            socket.emit('join-room', {
                roomId: data.roomId,
                user: {
                    id: window.USER_ID,
                    username: window.USERNAME
                }
            });

            window.location.href = data.redirectTo;
        } catch (err) {
            console.error('[QuickJoin]', err);
            alert('Could not join or create a public room');
            btn.disabled = false;
        }
    });
}
