import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { createRouter } from './interface/routes';
import { errorHandler } from './interface/middlewares/errorHandler';

// Cache database connection for serverless function reuse
let cachedDb: typeof mongoose | null = null;

const connectDB = async () => {
  if (cachedDb) return cachedDb;
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_db';
  
  try {
    const db = await mongoose.connect(MONGO_URI);
    cachedDb = db;
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const createApp = () => {
  const app = express();

  // 1. DB connection middleware (Ensure this is FIRST)
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      res.status(500).json({ error: 'Database connection failed' });
    }
  });

  // 2. Basic Request Logger for Vercel debugging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - From: ${req.headers.origin || 'No Origin'}`);
    next();
  });

  // 3. Security Middlewares
  app.use(helmet());

  const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL?.replace(/\/$/, ''),
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Rejected: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  app.use(cookieParser());
  app.use(express.json());

  // 4. Routes
  app.use('/api', createRouter());

  // 5. Global Error Handler
  app.use(errorHandler);

  return app;
};
