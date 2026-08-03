const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/:uid', notificationController.getNotifications);
router.get('/:uid/unread', notificationController.getUnreadCount);
router.put('/:uid/read', notificationController.markAllRead);
router.put('/read/:id', notificationController.markOneRead);

module.exports = router;
