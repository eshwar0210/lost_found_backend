import axios from 'axios';
import { getSocket } from './socket';
import BASE_URL from '../config';

export const searchUsers = async (q) => {
  const { data } = await axios.get(`${BASE_URL}/auth/users/search`, { params: { q } });
  return data;
};

export const getOrCreateConversation = async (userA, userB) => {
  const { data } = await axios.get(`${BASE_URL}/chat/conversation`, { params: { userA, userB } });
  return data;
};

export const getConversations = async (uid) => {
  const { data } = await axios.get(`${BASE_URL}/chat/conversations/${uid}`);
  return data;
};

export const getMessages = async (conversationId) => {
  const { data } = await axios.get(`${BASE_URL}/chat/messages/${conversationId}`);
  return data;
};

export const markConversationRead = async (conversationId, uid) => {
  await axios.put(`${BASE_URL}/chat/read/${conversationId}`, { uid });
};

export const sendMessage = async ({ conversationId, text, clientId }) => {
  const uid = localStorage.getItem('uid');
  const resolvedClientId =
    clientId || `c-${uid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const socket = getSocket();

  if (socket && socket.connected) {
    try {
      const result = await new Promise((resolve, reject) => {
        socket.timeout(5000).emit('chat:send', { conversationId, text, clientId: resolvedClientId }, (err, res) => {
          if (err || !res || !res.ok) {
            reject(new Error((res && res.error) || 'Socket send failed'));
          } else {
            resolve(res.message);
          }
        });
      });
      return result;
    } catch (error) {
      console.error('Socket send failed, falling back to REST:', error.message);
    }
  }

  const { data } = await axios.post(`${BASE_URL}/chat/messages/${conversationId}`, {
    text,
    clientId: resolvedClientId,
  });
  return data;
};
