import axios from 'axios';
import BASE_URL from '../config';

export const getUnreadCount = async (uid) => {
  const { data } = await axios.get(`${BASE_URL}/notifications/${uid}/unread`);
  return data.count;
};

export const getNotifications = async (uid, page = 1, limit = 50) => {
  const { data } = await axios.get(`${BASE_URL}/notifications/${uid}`, { params: { page, limit } });
  return data.docs || data;
};

export const markAllNotificationsRead = async (uid) => {
  await axios.put(`${BASE_URL}/notifications/${uid}/read`);
};

export const markNotificationRead = async (id) => {
  await axios.put(`${BASE_URL}/notifications/read/${id}`);
};
