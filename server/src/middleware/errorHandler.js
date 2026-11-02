import { ApiError } from '../utils/ApiError.js';

const PRISMA_ERRORS = {
  P2002: [409, 'This record already exists'],
  P2003: [400, 'Referenced record does not exist'],
  P2025: [404, 'Record not found'],
  P2034: [409, 'Too many people are booking at once — please try again'],
};

export const notFoundHandler = (req, _res, next) =>
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) return res.status(err.status).json({ message: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });

  const known = PRISMA_ERRORS[err.code];
  if (known) return res.status(known[0]).json({ message: known[1] });

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
