const express = require('express');
const router = express.Router();
const { 
  getMessagesByRoom, 
  createMessage, 
  deleteMessage 
} = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/rooms/:roomId/messages', authMiddleware, getMessagesByRoom);
router.post('/rooms/:roomId/messages', authMiddleware, createMessage);
router.delete('/messages/:messageId', authMiddleware, deleteMessage);

module.exports = router;