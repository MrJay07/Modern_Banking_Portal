import winston from 'winston';
import path from 'path';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const isDevelopment = process.env['NODE_ENV'] !== 'production';

const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'banking-portal-backend' },
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: combine(timestamp(), json()),
    })
  );
}

export default logger;
