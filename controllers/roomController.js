const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const creatorId = req.user._id;

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room already exists' });
    }
    
    const room = new Room({ name, creator: creatorId });
    await room.save();
    
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Room creation failed', error: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('creator', 'username');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};
