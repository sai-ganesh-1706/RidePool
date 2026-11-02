import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const locations = await prisma.location.findMany({
      orderBy: [{ isCampus: 'desc' }, { name: 'asc' }],
    });
    res.json({ locations });
  }),
);

export default router;
