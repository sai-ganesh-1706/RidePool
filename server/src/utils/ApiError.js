export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  static badRequest = (message) => new ApiError(400, message);
  static unauthorized = (message = 'Unauthorized') => new ApiError(401, message);
  static forbidden = (message = 'Forbidden') => new ApiError(403, message);
  static notFound = (message = 'Not found') => new ApiError(404, message);
  static conflict = (message) => new ApiError(409, message);
  static tooMany = (message) => new ApiError(429, message);
}
