const User = require('../models/User');
const Message = require('../models/Message');

module.exports = (io) => {
  const onlineUsers = {}; // Keeps track of users per room
  const socketUserMap = {}; // Maps socket IDs to user and room info

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining a room
    socket.on('joinRoom', async ({ roomId, userId }) => {
      socket.join(roomId);

      if (!onlineUsers[roomId]) {
        onlineUsers[roomId] = new Set();
      }

      const user = await User.findById(userId);
      if (user) {
        onlineUsers[roomId].add(user.username);
        socketUserMap[socket.id] = { username: user.username, roomId };

        // Emit the updated online users list for the room
        io.to(roomId).emit('onlineUsers', Array.from(onlineUsers[roomId]));
      }

      // Fetch previous messages for the room
      const messages = await Message.find({ room: roomId })
        .populate('user', 'username')
        .sort({ createdAt: 1 });
      socket.emit('previousMessages', messages);
    });

    // Handle user typing event
    socket.on('typing', async ({ roomId, userId, isTyping }) => {
      const user = await User.findById(userId);
      socket.to(roomId).emit('userTyping', {
        userId,
        username: user ? user.username : 'Unknown User',
        isTyping
      });
    });

    // Handle user sending a chat message
    socket.on('chatMessage', async (messageData) => {
      const { roomId, userId, text } = messageData;

      const user = await User.findById(userId);

      const message = new Message({
        room: roomId,
        user: userId,
        text
      });

      await message.save();

      io.to(roomId).emit('newMessage', {
        _id: message._id,
        text: message.text,
        user: { username: user ? user.username : 'Unknown User' }
      });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      const userData = socketUserMap[socket.id];
      if (userData) {
        const { username, roomId } = userData;

        if (onlineUsers[roomId]) {
          onlineUsers[roomId].delete(username);

          // Emit the updated online users list for the room
          io.to(roomId).emit('onlineUsers', Array.from(onlineUsers[roomId]));
        }

        // Remove the user from the socket-user map
        delete socketUserMap[socket.id];
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });
};




// const User = require('../models/User');
// const Message = require('../models/Message');

// module.exports = (io) => {
//   const onlineUsers = {};

//   io.on('connection', (socket) => {
//     socket.on('joinRoom', async ({ roomId, userId }) => {
//       socket.join(roomId);
      
//       if (!onlineUsers[roomId]) {
//         onlineUsers[roomId] = new Set();
//       }
      
//       const user = await User.findById(userId);
//       onlineUsers[roomId].add(user.username);
      
//       const messages = await Message.find({ room: roomId })
//         .populate('user', 'username')
//         .sort({ createdAt: 1 });
      
//       io.to(roomId).emit('onlineUsers', Array.from(onlineUsers[roomId]));
//       socket.emit('previousMessages', messages);
//     });

//     socket.on('typing', async ({ roomId, userId, isTyping }) => {
//       const user = await User.findById(userId);
//       socket.to(roomId).emit('userTyping', {
//         userId,
//         username: user ? user.username : 'Unknown User',
//         isTyping
//       });
//     });

//     socket.on('chatMessage', async (messageData) => {
//       const { roomId, userId, text } = messageData;
      
//       const user = await User.findById(userId);
      
//       const message = new Message({
//         room: roomId,
//         user: userId,
//         text
//       });
      
//       await message.save();
      
//       io.to(roomId).emit('newMessage', {
//         _id: message._id,
//         text: message.text,
//         user: { username: user ? user.username : 'Unknown User' }
//       });
//     });

//     socket.on('disconnect', () => {
//       Object.keys(onlineUsers).forEach(roomId => {
//         const roomUsers = onlineUsers[roomId];
//         socket.rooms.forEach(room => {
//           if (roomUsers) {
//             roomUsers.delete(socket.username);
//             io.to(roomId).emit('onlineUsers', Array.from(roomUsers));
//           }
//         });
//       });
//     });
//   });
// };