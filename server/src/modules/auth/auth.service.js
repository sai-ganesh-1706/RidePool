import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../utils/token.js';

const BCRYPT_ROUNDS = 10;

export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  hostelBlock: user.hostelBlock,
  roomNumber: user.roomNumber,
  role: user.role,
});

function assertAllowedEmailDomain(email) {
  if (!env.ALLOWED_EMAIL_DOMAIN) return;
  if (!email.endsWith(`@${env.ALLOWED_EMAIL_DOMAIN}`)) {
    throw ApiError.badRequest(`Please sign up with your @${env.ALLOWED_EMAIL_DOMAIN} college email`);
  }
}

export async function register({ password, ...profile }) {
  assertAllowedEmailDomain(profile.email);

  const existing = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await prisma.user.create({
    data: {
      ...profile,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: roleFor(profile.email),
    },
  });
  return { user: toPublicUser(user), token: signToken(user.id) };
}

const roleFor = (email) => (env.ADMIN_EMAILS.includes(email) ? 'ADMIN' : 'STUDENT');

export async function login({ email, password }) {
  let user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid || !user.isActive) throw ApiError.unauthorized('Incorrect email or password');

  // ADMIN_EMAILS is the source of truth for admin access, so changing it takes effect on next login.
  if (user.role !== roleFor(email)) {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: roleFor(email) } });
  }
  return { user: toPublicUser(user), token: signToken(user.id) };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return toPublicUser(user);
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return toPublicUser(user);
}
