import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createRouter } from './interface/routes';
import { errorHandler } from './interface/middlewares/errorHandler';

export const createApp = () => {
  const app = express();

  // Middlewares
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json());

  // Routes
  app.use('/api', createRouter());

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
