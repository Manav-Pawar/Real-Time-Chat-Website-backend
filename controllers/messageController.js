const Message = require('../models/Message');
const Room = require('../models/Room');

exports.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Fetch messages for the specific room
    const messages = await Message.find({ room: roomId })
      .populate('user', 'username')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching messages', 
      error: error.message 
    });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create new message
    const message = new Message({
      room: roomId,
      user: userId,
      text
    });

    await message.save();

    // Populate user details
    await message.populate('user', 'username');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating message', 
      error: error.message 
    });
  }
};

// Optional: Add method to delete messages
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Ensure only the message creator can delete
    if (message.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting message', 
      error: error.message 
    });
  }
};