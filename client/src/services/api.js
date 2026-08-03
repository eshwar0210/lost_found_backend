import axios from 'axios';
import { getAuth } from 'firebase/auth';

export const getAuthToken = async () => {
  const user = getAuth().currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      if (token) {
        localStorage.setItem('authToken', token);
        return token;
      }
    } catch (error) {
      console.error('Error refreshing token:', error.message);
    }
  }
  return localStorage.getItem('authToken');
};

export const authHeaders = async () => {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

axios.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
