const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/conversations/:uid', chatController.getConversations);
router.get('/conversation', chatController.getOrCreateConversation);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/messages/:conversationId', chatController.sendMessage);
router.put('/read/:conversationId', chatController.markRead);

module.exports = router;
