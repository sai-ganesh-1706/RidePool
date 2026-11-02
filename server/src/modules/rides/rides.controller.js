import { asyncHandler } from '../../utils/asyncHandler.js';
import * as chatService from '../chat/chat.service.js';
import * as ridesService from './rides.service.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ rides: await ridesService.listRides(req.user.id, req.query) });
});

export const listMine = asyncHandler(async (req, res) => {
  res.json({ rides: await ridesService.listMyRides(req.user.id) });
});

export const suggestions = asyncHandler(async (req, res) => {
  res.json({ rides: await ridesService.findSimilarRides(req.user.id, req.query) });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ ride: await ridesService.getRide(req.params.id, req.user.id) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ ride: await ridesService.createRide(req.user.id, req.body) });
});

export const join = asyncHandler(async (req, res) => {
  res.json({ ride: await ridesService.joinRide(req.params.id, req.user.id) });
});

export const leave = asyncHandler(async (req, res) => {
  res.json({ ride: await ridesService.leaveRide(req.params.id, req.user.id) });
});

export const cancel = asyncHandler(async (req, res) => {
  res.json({ ride: await ridesService.cancelRide(req.params.id, req.user.id) });
});

export const setDriver = asyncHandler(async (req, res) => {
  res.json({ ride: await ridesService.setRideDriver(req.params.id, req.user.id, req.body.driverId) });
});

export const complete = asyncHandler(async (req, res) => {
  res.json({ ride: await ridesService.completeRide(req.params.id, req.user.id, req.body.totalFare) });
});

export const setPayment = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  res.json({ ride: await ridesService.setPaymentStatus(id, req.user.id, userId, req.body.status) });
});

export const messages = asyncHandler(async (req, res) => {
  res.json({ messages: await chatService.listMessages(req.params.id, req.user.id) });
});
