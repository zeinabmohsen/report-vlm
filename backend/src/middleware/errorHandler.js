import { AppError } from '../errors/AppError.js';

export function errorHandler(err, req, res, _next) {
  const status  = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path}\n`, err.stack);
  } else {
    console.warn(`[WARN]  ${req.method} ${req.path} → ${status}: ${message}`);
  }

  res.status(status).json({ error: message });
}
