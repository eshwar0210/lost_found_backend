import BASE_URL from '../config';
import { io } from 'socket.io-client';

let socket = null;
let connectedUid = null;

export const getSocket = () => socket;

export const connectSocket = (uid) => {
  if (!uid) return null;
  if (socket && connectedUid === uid) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  connectedUid = uid;
  socket = io(BASE_URL || undefined, {
    auth: { uid },
    transports: ['websocket', 'polling'],
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  connectedUid = null;
};

export const onSocketEvent = (event, handler) => {
  if (!socket) return () => {};
  socket.on(event, handler);
  return () => socket.off(event, handler);
};
