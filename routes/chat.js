const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

router.get('/conversations/:uid', requireAuth, chatController.getConversations);
router.get('/conversation', requireAuth, chatController.getOrCreateConversation);
router.get('/messages/:conversationId', requireAuth, chatController.getMessages);
router.post('/messages/:conversationId', requireAuth, chatController.sendMessage);
router.put('/read/:conversationId', requireAuth, chatController.markRead);

module.exports = router;
