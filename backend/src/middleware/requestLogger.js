import { randomUUID } from 'crypto';

export function requestLogger(req, res, next) {
  const id = randomUUID();
  const start = Date.now();
  res.locals.requestId = id;

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(`[${level}] ${req.method} ${req.path} ${res.statusCode} — ${ms}ms  [${id}]`);
  });

  next();
}
