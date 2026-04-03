import dotenv from 'dotenv';
dotenv.config();
import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 3000;

// Start local server if not in a Vercel/serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Local server listening on port ${PORT}`);
  });
}

// Export for Vercel Serverless
export default app;
