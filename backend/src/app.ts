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
  // If we have a cached connection, check its state
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // If a connection is already in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('[DB] Connection in progress, waiting...');
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (mongoose.connection.readyState === 1) {
          clearInterval(interval);
          resolve(cachedDb);
        }
      }, 100);
    });
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('[DB] CRITICAL: MONGO_URI is not defined in environment variables.');
    throw new Error('Database configuration missing');
  }

  try {
    console.log('[DB] Connecting to MongoDB...');
    const db = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    cachedDb = db;
    console.log('[DB] Successfully connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('[DB] Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const createApp = () => {
  const app = express();

  // Enable trust proxy for Vercel (crucial for correct IP detection)
  app.set('trust proxy', 1);

  // Diagnostic: Check for environment variables (without logging their values)
  const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  requiredEnv.forEach(env => {
    if (!process.env[env]) {
      console.warn(`[WARN] Missing environment variable: ${env}`);
    }
  });

  // 1. Logging & CORS (Must be FIRST to handle preflights instantly)
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'}`);
    next();
  });

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

  // 2. DB connection middleware (Delayed until after CORS Preflight)
  app.use(async (req, res, next) => {
    // OPTIMIZATION: Don't connect to DB for OPTIONS/Preflight
    if (req.method === 'OPTIONS') return next();
    
    try {
      await connectDB();
      next();
    } catch (error) {
      res.status(500).json({ error: 'Database connection failed' });
    }
  });

  // 3. Security & Body Parsers
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json());

  // 4. Health Check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 5. Routes
  app.use('/api', createRouter());


  app.use('/api', (req, res) => {
    console.warn(`[404] ${req.method} ${req.originalUrl} - Not Found`);
    res.status(404).json({
      error: 'Not Found',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
      path: req.originalUrl,
      method: req.method
    });
  });


  app.use(errorHandler);

  return app;
};
