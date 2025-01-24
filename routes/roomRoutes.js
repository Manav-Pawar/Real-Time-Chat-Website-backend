const express = require('express');
const router = express.Router();
const { createRoom, getRooms } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/rooms', authMiddleware, createRoom);
router.get('/rooms', authMiddleware, getRooms);

module.exports = router;