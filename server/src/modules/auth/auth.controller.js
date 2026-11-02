import { asyncHandler } from '../../utils/asyncHandler.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  res.status(201).json(await authService.register(req.body));
});

export const login = asyncHandler(async (req, res) => {
  res.json(await authService.login(req.body));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: await authService.getProfile(req.user.id) });
});

export const updateMe = asyncHandler(async (req, res) => {
  res.json({ user: await authService.updateProfile(req.user.id, req.body) });
});
