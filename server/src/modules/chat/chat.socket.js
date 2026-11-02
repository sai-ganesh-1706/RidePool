import { verifyToken } from '../../utils/token.js';
import { assertRideMember, sendMessage } from './chat.service.js';

const roomName = (rideId) => `ride:${rideId}`;

/** Wraps a socket event handler so errors are reported through the ack callback. */
const withAck = (socket, handler) => async (payload, ack) => {
  const reply = typeof ack === 'function' ? ack : () => {};
  try {
    await handler(payload ?? {}, socket.data.userId);
    reply({ ok: true });
  } catch (err) {
    reply({ ok: false, error: err.status ? err.message : 'Something went wrong' });
  }
};

export function registerChatSocket(io) {
  io.use((socket, next) => {
    try {
      socket.data.userId = verifyToken(socket.handshake.auth?.token);
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on(
      'join_ride_chat',
      withAck(socket, async ({ rideId }, userId) => {
        await assertRideMember(rideId, userId);
        socket.join(roomName(rideId));
      }),
    );

    socket.on(
      'send_message',
      withAck(socket, async ({ rideId, content }, userId) => {
        const message = await sendMessage(rideId, userId, content);
        io.to(roomName(rideId)).emit('new_message', message);
      }),
    );
  });
}
