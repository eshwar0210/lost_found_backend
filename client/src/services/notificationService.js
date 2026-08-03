import axios from 'axios';
import BASE_URL from '../config';

export const getUnreadCount = async (uid) => {
  const { data } = await axios.get(`${BASE_URL}/notifications/${uid}/unread`);
  return data.count;
};

export const getNotifications = async (uid) => {
  const { data } = await axios.get(`${BASE_URL}/notifications/${uid}`);
  return data;
};

export const markAllNotificationsRead = async (uid) => {
  await axios.put(`${BASE_URL}/notifications/${uid}/read`);
};

export const markNotificationRead = async (id) => {
  await axios.put(`${BASE_URL}/notifications/read/${id}`);
};
