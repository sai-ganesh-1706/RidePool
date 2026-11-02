import { z } from 'zod';

export const listDriversQuery = z.object({
  search: z.string().trim().max(50).optional(),
});

export const createDriverSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^\+?\d{10,13}$/, 'Enter a valid phone number')),
  vehicleNumber: z.string().trim().max(20).optional().or(z.literal('').transform(() => undefined)),
  vehicleType: z.enum(['AUTO', 'CAB', 'TEMPO']).default('AUTO'),
});

export const rateDriverSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(300).optional().or(z.literal('').transform(() => undefined)),
});
