import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './auth.controller.js';
import { loginSchema, registerSchema, updateProfileSchema } from './auth.schema.js';

const router = Router();

const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});

router.post('/register', credentialsLimiter, validate(registerSchema), controller.register);
router.post('/login', credentialsLimiter, validate(loginSchema), controller.login);
router.get('/me', requireAuth, controller.me);
router.patch('/me', requireAuth, validate(updateProfileSchema), controller.updateMe);

export default router;
