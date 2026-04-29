export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg) { return new AppError(400, msg); }
  static notFound(msg)   { return new AppError(404, msg); }
  static badGateway(msg) { return new AppError(502, msg); }
  static internal(msg)   { return new AppError(500, msg); }
}
