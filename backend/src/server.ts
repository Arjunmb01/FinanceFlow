import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { createApp } from './app';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_db';

const app = createApp();

// Cache database connection
let cachedDb: typeof mongoose | null = null;

const connectDB = async () => {
  if (cachedDb) return cachedDb;
  
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

// Middleware to ensure DB is connected before processing requests (Serverless only)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Start local server if not in a Vercel/serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Initial startup failed:', err);
  });
}

// Export for Vercel
export default app;
