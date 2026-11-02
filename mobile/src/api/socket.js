import { io } from 'socket.io-client';
import { API_URL } from '../config';

export const createSocket = (token) =>
  io(API_URL, { auth: { token }, transports: ['websocket'], reconnectionDelayMax: 5000 });
