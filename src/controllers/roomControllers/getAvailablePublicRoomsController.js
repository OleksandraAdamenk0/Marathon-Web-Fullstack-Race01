const Room = require('../../models/Room');
const roomModel = new Room();

module.exports = async (req, res) => {
    try{
        const rooms = await roomModel.getAvailablePublicRooms();
        if (rooms === null) throw new Error('Failed to load available rooms');
        res.status(200).json({
            message: 'Successfully loaded available rooms',
            roomsData: rooms
        });
    } catch (error) {
        console.error['[getAllAvailableRoomsController]', error];
        res.status(500).json({error: 'Failed to load available rooms'});
    }

}