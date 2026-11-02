import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\+?\d{10,13}$/, 'Enter a valid phone number'));

const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal('').transform(() => undefined));

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone,
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  hostelBlock: optionalText(50),
  roomNumber: optionalText(20),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: phone.optional(),
  hostelBlock: optionalText(50),
  roomNumber: optionalText(20),
});
