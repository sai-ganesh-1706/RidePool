import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized('Missing access token');

  let userId;
  try {
    userId = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user?.isActive) throw ApiError.unauthorized('Account not found or disabled');

  req.user = { id: user.id, role: user.role };
  next();
});

export const requireAdmin = (req, _res, next) =>
  req.user?.role === 'ADMIN' ? next() : next(ApiError.forbidden('Admin access required'));
