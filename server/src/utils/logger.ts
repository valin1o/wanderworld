import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

const SENSITIVE_FIELDS = ['password', 'passwordHash', 'refreshToken', 'refreshTokenHash', 'authorization', 'stripe'];

function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((f) => lower.includes(f))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const redactFormat = winston.format((info) => {
  return redactSensitive(info as Record<string, unknown>) as winston.Logform.TransformableInfo;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    redactFormat(),
    json(),
  ),
  defaultMeta: { service: 'wanderworld-api' },
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

export default logger;
