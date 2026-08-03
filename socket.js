const { Server } = require('socket.io');

let io = null;
const onlineUsers = new Map();

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    const auth = socket.handshake.auth || {};
    if (!auth.token) return next(new Error('unauthorized'));
    try {
      const { admin } = require('./firebase');
      const decodedToken = await admin.auth().verifyIdToken(auth.token);
      if (auth.uid && decodedToken.uid !== auth.uid) return next(new Error('unauthorized'));
      socket.uid = decodedToken.uid;
      next();
    } catch (error) {
      return next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.uid}`);
    socket.join(`online:${socket.uid}`);

    if (!onlineUsers.has(socket.uid)) onlineUsers.set(socket.uid, new Set());
    onlineUsers.get(socket.uid).add(socket.id);

    const onlineUids = Array.from(onlineUsers.keys());
    socket.emit('presence:init', { onlineUids });
    io.emit('chat:online', { uid: socket.uid, online: true });

    socket.on('chat:send', async (payload, ack) => {
      try {
        const { handleChatMessage } = require('./controllers/chatController');
        const message = await handleChatMessage({
          conversationId: payload.conversationId,
          senderUid: socket.uid,
          text: payload.text,
          clientId: payload.clientId,
        });
        if (typeof ack === 'function') ack({ ok: true, message });
      } catch (error) {
        console.error('Socket chat:send error:', error.message);
        if (typeof ack === 'function') ack({ ok: false, error: error.message });
      }
    });

    socket.on('chat:join', (conversationId) => {
      if (conversationId) socket.join(`conversation:${conversationId}`);
    });

    socket.on('chat:typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('chat:typing', {
        uid: socket.uid,
        conversationId,
      });
    });

    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(socket.uid);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.uid);
          io.emit('chat:online', { uid: socket.uid, online: false });
          const User = require('./models/User');
          User.findOneAndUpdate({ uid: socket.uid }, { lastSeenAt: new Date() })
            .catch((err) => console.error('Error updating lastSeenAt:', err.message));
        }
      }
    });
  });

  return io;
};

const getIO = () => io;

const emitToUser = (uid, event, data) => {
  if (io) io.to(`user:${uid}`).emit(event, data);
};

const isUserOnline = (uid) => onlineUsers.has(uid) && onlineUsers.get(uid).size > 0;

module.exports = { setupSocket, getIO, emitToUser, isUserOnline, onlineUsers };
