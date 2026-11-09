import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').trim();
        if (key && val && process.env[key.trim()] === undefined) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
} catch {
  // Ignore error if .env is missing
}

import mongoose from 'mongoose';
import app from './app';
import logger from './utils/logger';

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/wanderworld';

async function start(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI as string);
    logger.info('Connected to MongoDB');

    const server = app.listen(PORT, '127.0.0.1', () => {
      logger.info(`Server listening`, { port: PORT, env: process.env.NODE_ENV ?? 'development' });
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully.`);
      server.close(async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', { error: err instanceof Error ? err.message : 'unknown' });
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message });
  process.exit(1);
});

void start();
