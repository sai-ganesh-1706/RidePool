import http from 'node:http';
import { Server } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { startRideExpiryJob } from './jobs/expireRides.js';
import { registerChatSocket } from './modules/chat/chat.socket.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.CLIENT_ORIGIN === '*' ? true : env.CLIENT_ORIGIN.split(',') },
});

registerChatSocket(io);
startRideExpiryJob();

server.listen(env.PORT, () => {
  console.log(`RidePool API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  io.close();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
