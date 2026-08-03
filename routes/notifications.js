const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

router.get('/:uid', requireAuth, notificationController.getNotifications);
router.get('/:uid/unread', requireAuth, notificationController.getUnreadCount);
router.put('/:uid/read', requireAuth, notificationController.markAllRead);
router.put('/read/:id', requireAuth, notificationController.markOneRead);

module.exports = router;
