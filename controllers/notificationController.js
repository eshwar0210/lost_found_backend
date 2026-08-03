const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationEmail } = require('../utils/emailer');

const createNotification = async ({ recipientUid, fromUid, fromName, type, text, postId, conversationId }) => {
  if (!recipientUid || recipientUid === fromUid) return null;

  const notification = await Notification.create({
    recipientUid,
    fromUid,
    fromName,
    type,
    text,
    postId,
    conversationId,
  });

  const plain = notification.toObject();
  const { emitToUser } = require('../socket');
  emitToUser(recipientUid, 'notifications:new', plain);

  if (process.env.SMTP_HOST) {
    const base = (process.env.APP_URL || process.env.CLIENT_ORIGIN || '').replace(/\/+$/, '');
    if (base) {
      const recipient = await User.findOne({ uid: recipientUid }).catch(() => null);
      if (recipient && recipient.email) {
        const { isUserOnline } = require('../socket');
        // Email chat notifications only when the recipient is offline to avoid spam.
        if (type === 'comment' || !isUserOnline(recipientUid)) {
          const link =
            type === 'comment'
              ? `${base}/post/${postId || ''}`
              : `${base}/chat?with=${fromUid}`;
          await sendNotificationEmail({
            to: recipient.email,
            name: recipient.name,
            actorName: fromName,
            kind: type,
            preview: text,
            link,
          });
        }
      }
    } else {
      console.log('APP_URL not configured — skipping email notification link.');
    }
  }

  return plain;
};

exports.getNotifications = async (req, res) => {
  const uid = req.uid; // Verified user from the auth middleware
  try {
    const notifications = await Notification.find({ recipientUid: uid })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  const uid = req.uid; // Verified user from the auth middleware
  try {
    const count = await Notification.countDocuments({ recipientUid: uid, read: false });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAllRead = async (req, res) => {
  const uid = req.uid; // Verified user from the auth middleware
  try {
    await Notification.updateMany({ recipientUid: uid, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markOneRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notification.recipientUid !== req.uid) {
      return res.status(403).json({ message: 'You are not authorized to update this notification' });
    }
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createNotification = createNotification;
