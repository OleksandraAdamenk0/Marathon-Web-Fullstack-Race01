const Room = require('../../models/Room');
const User = require('../../models/User');

const userModel = new User();
const roomModel = new Room();

module.exports = async (req, res) => {
    console.log('[CREATE ROOM] Controller hit!');
    console.log('req.user:', req.user);
    try {
        const userId = req.user.id;
        const user = await userModel.getById(userId);
        if (!user) return res.status(400).json({ error: 'User not found' });

        // get rooms with waiting status
        const availableRooms = await roomModel.getAvailablePublicRooms();
        console.log('availableRooms:', availableRooms);
        let room;
        if (!availableRooms || availableRooms.length === 0) {
            // no rooms
            room = await roomModel.createPublicRoom(userId);
            if (!room) throw new Error('Failed to insert room in DB');
        } else {
            // find available room where the user is not a player
            const availableRoom = availableRooms.find(r =>
                r.player_one_id !== user.id && r.player_two_id !== user.id
            );

            if (availableRoom) {
                room = availableRoom;
                await roomModel.setSecondPlayer(room.id, userId);
            } else {
                room = await roomModel.createPublicRoom(userId);
                if (!room) throw new Error('Failed to insert room in DB');
            }
        }


        
        const io = req.app.get('io');
        io.emit('room-created', {
            id: room.id,
            status: room.status,
            player_one_id: room.player_one_id,
            player_two_id: room.player_two_id,
            code: room.code
        });

        if (req.query.json === 'true') {
            return res.status(200).json({
                success: true,
                message: 'Public room created',
                roomId: room.id,
                redirectTo: `/room/${room.id}`
            });
        }

        res.redirect(`/room/${room.id}`);
    } catch (error) {
        console.error('[CreatePublicRoomController]', error);
        res.status(500).send('Failed to create public room');
    }
};
