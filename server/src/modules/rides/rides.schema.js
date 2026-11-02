import { z } from 'zod';

const uuid = z.string().uuid('Invalid id');
const optionalNotes = z.string().trim().max(200).optional().or(z.literal('').transform(() => undefined));

export const createRideSchema = z.object({
  fromLocationId: uuid,
  toLocationId: uuid,
  departureTime: z.coerce.date(),
  maxRiders: z.number().int().min(2).max(4).default(3),
  notes: optionalNotes,
});

export const suggestionsQuery = z.object({
  fromLocationId: uuid,
  toLocationId: uuid,
  departureTime: z.coerce.date(),
});

export const listRidesQuery = z.object({
  toLocationId: uuid.optional(),
});

export const setDriverSchema = z.object({ driverId: uuid });

export const completeRideSchema = z.object({
  totalFare: z.number().int().min(1, 'Enter the total fare').max(10000),
});

export const paymentParams = z.object({ id: uuid, userId: uuid });
export const paymentSchema = z.object({ status: z.enum(['PENDING', 'PAID']) });
