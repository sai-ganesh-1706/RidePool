import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const MAX_MESSAGE_LENGTH = 500;
const HISTORY_LIMIT = 100;

const messageSelect = {
  id: true,
  rideId: true,
  content: true,
  createdAt: true,
  sender: { select: { id: true, name: true } },
};

export async function assertRideMember(rideId, userId) {
  const member = await prisma.rideMember.findFirst({
    where: { rideId, userId, status: 'JOINED' },
    select: { id: true },
  });
  if (!member) throw ApiError.forbidden('Only riders of this ride can use the chat');
}

export async function listMessages(rideId, userId) {
  await assertRideMember(rideId, userId);
  const messages = await prisma.message.findMany({
    where: { rideId },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_LIMIT,
    select: messageSelect,
  });
  return messages.reverse();
}

export async function sendMessage(rideId, userId, content) {
  const text = typeof content === 'string' ? content.trim() : '';
  if (!text || text.length > MAX_MESSAGE_LENGTH) {
    throw ApiError.badRequest(`Message must be 1–${MAX_MESSAGE_LENGTH} characters`);
  }
  await assertRideMember(rideId, userId);
  return prisma.message.create({
    data: { rideId, senderId: userId, content: text },
    select: messageSelect,
  });
}
