import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (userId) =>
  jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: env.JWT_EXPIRES_IN });

/** Returns the user id encoded in the token or throws if invalid/expired. */
export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET).sub;
