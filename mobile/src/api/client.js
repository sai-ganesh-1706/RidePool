import axios from 'axios';
import { API_URL } from '../config';

const client = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 45000, // free hosting can take a while to wake up
});

let onUnauthorized = null;

export const setAuthToken = (token) => {
  if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete client.defaults.headers.common.Authorization;
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register');
    if (error.response?.status === 401 && !isAuthRoute) onUnauthorized?.();
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (error.message === 'Network Error') return 'Cannot reach the server. Check your internet connection.';
  return 'Something went wrong. Please try again.';
}

export default client;
