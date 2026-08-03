const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { emitToUser, isUserOnline } = require('../socket');
const { createNotification } = require('./notificationController');

const getUserByUid = async (uid) => {
  const user = await User.findOne({ uid });
  return user
    ? { uid: user.uid, name: user.name, profilePhotoUrl: user.profilePhotoUrl, lastSeenAt: user.lastSeenAt }
    : { uid, name: 'Unknown user', profilePhotoUrl: null, lastSeenAt: null };
};

exports.handleChatMessage = async ({ conversationId, senderUid, text, clientId }) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation id');
  }
  const trimmed = (text || '').trim();
  if (!trimmed) throw new Error('Message cannot be empty');

  if (clientId) {
    const existing = await Message.findOne({ conversationId, clientId });
    if (existing) return existing.toObject();
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error('Conversation not found');
  if (!conversation.participants.includes(senderUid)) {
    throw new Error('You are not part of this conversation');
  }

  const message = await Message.create({
    conversationId,
    senderUid,
    text: trimmed,
    clientId: clientId || undefined,
  });

  conversation.lastMessageAt = message.createdAt;
  conversation.lastMessagePreview = trimmed.slice(0, 80);
  await conversation.save();

  const recipientUid = conversation.participants.find((p) => p !== senderUid);

  const payload = { message: message.toObject(), conversationId };
  emitToUser(senderUid, 'chat:message', payload);
  emitToUser(recipientUid, 'chat:message', payload);

  if (recipientUid && isUserOnline(recipientUid)) {
    emitToUser(senderUid, 'chat:delivered', { conversationId, messageId: message._id });
  }

  if (recipientUid) {
    const sender = await getUserByUid(senderUid);
    await createNotification({
      recipientUid,
      fromUid: senderUid,
      fromName: sender.name,
      type: 'chat',
      text: trimmed,
      conversationId,
    });
  }

  return message.toObject();
};

exports.getOrCreateConversation = async (req, res) => {
  const userA = req.uid; // Verified user from the auth middleware
  const { userB } = req.query;
  if (!userA || !userB || userA === userB) {
    return res.status(400).json({ message: 'Two different users are required' });
  }

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [userA, userB] },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [userA, userB] });
    }

    const otherUid = conversation.participants.find((p) => p !== userA);
    const otherUser = await getUserByUid(otherUid);

    res.status(200).json({ conversation, otherUser });
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getConversations = async (req, res) => {
  const uid = req.uid; // Verified user from the auth middleware
  try {
    const conversations = await Conversation.find({ participants: uid }).sort({
      lastMessageAt: -1,
    });

    const conversationIds = conversations.map((c) => c._id);

    const unread = await Message.aggregate([
      { $match: { conversationId: { $in: conversationIds }, senderUid: { $ne: uid }, read: false } },
      { $group: { _id: '$conversationId', count: { $sum: 1 } } },
    ]);
    const unreadMap = {};
    unread.forEach((u) => {
      unreadMap[u._id] = u.count;
    });

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUid = conversation.participants.find((p) => p !== uid);
        const otherUser = await getUserByUid(otherUid);
        return {
          _id: conversation._id,
          participants: conversation.participants,
          lastMessageAt: conversation.lastMessageAt,
          lastMessagePreview: conversation.lastMessagePreview,
          otherUser,
          unreadCount: unreadMap[conversation._id] || 0,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.includes(req.uid)) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const senderUid = req.uid; // Verified user from the auth middleware
  const { text, clientId } = req.body;
  try {
    const message = await exports.handleChatMessage({ conversationId, senderUid, text, clientId });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.markRead = async (req, res) => {
  const { conversationId } = req.params;
  const uid = req.uid; // Verified user from the auth middleware
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.includes(uid)) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

    await Message.updateMany(
      { conversationId, senderUid: { $ne: uid }, read: false },
      { read: true }
    );

    const otherUid = conversation.participants.find((p) => p !== uid);
    if (otherUid) emitToUser(otherUid, 'chat:read', { conversationId, readerUid: uid });

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
