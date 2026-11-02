import { asyncHandler } from '../../utils/asyncHandler.js';
import * as driversService from './drivers.service.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ drivers: await driversService.listDrivers(req.user, req.query) });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ driver: await driversService.getDriver(req.params.id, req.user) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ driver: await driversService.createDriver(req.user, req.body) });
});

export const rate = asyncHandler(async (req, res) => {
  res.json({ driver: await driversService.rateDriver(req.user.id, req.params.id, req.body) });
});

export const reject = asyncHandler(async (req, res) => {
  res.json({ driver: await driversService.rejectDriver(req.params.id) });
});

export const verify = asyncHandler(async (req, res) => {
  res.json({ driver: await driversService.verifyDriver(req.params.id) });
});
