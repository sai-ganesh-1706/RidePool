import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import driversRoutes from './modules/drivers/drivers.routes.js';
import locationsRoutes from './modules/locations/locations.routes.js';
import ridesRoutes from './modules/rides/rides.routes.js';

const app = express();

app.set('trust proxy', 1); // running behind Render's proxy
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN === '*' ? true : env.CLIENT_ORIGIN.split(',') }));
app.use(express.json({ limit: '100kb' }));
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }),
);
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/rides', ridesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
