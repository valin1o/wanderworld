import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import toursRoutes from './routes/tours.routes';
import bookingsRoutes from './routes/bookings.routes';
import reviewsRoutes from './routes/reviews.routes';
import aiRoutes from './routes/ai.routes';
import usersRoutes from './routes/users.routes';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { stripeWebhook } from './controllers/bookings.controller';
import logger from './utils/logger';

const app: Application = express();

app.use(helmet());

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const configuredOrigin = process.env.CLIENT_ORIGIN?.trim();
const allowedOrigins = configuredOrigin
  ? [...defaultOrigins, configuredOrigin]
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  }),
);

// Stripe webhook requires raw body for signature verification
app.post('/api/bookings/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: { write: (message) => logger.info(message.trim(), {}) },
    }),
  );
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/tours/:tourId/reviews', reviewsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', usersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
