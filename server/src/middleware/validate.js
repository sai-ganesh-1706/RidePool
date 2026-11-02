import { ApiError } from '../utils/ApiError.js';

/** Validates req[source] with a zod schema and replaces it with the parsed value. */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.join('.');
      return next(ApiError.badRequest(field ? `${field}: ${issue.message}` : issue.message));
    }
    req[source] = result.data;
    next();
  };
