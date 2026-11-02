import 'dotenv/config';
import { z } from 'zod';

const csv = (value) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  CLIENT_ORIGIN: z.string().default('*'),
  ALLOWED_EMAIL_DOMAIN: z
    .string()
    .optional()
    .transform((value) => value?.trim().toLowerCase().replace(/^@/, '') || undefined),
  ADMIN_EMAILS: z.string().optional().transform(csv),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
