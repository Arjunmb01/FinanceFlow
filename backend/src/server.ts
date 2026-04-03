import dotenv from 'dotenv';
dotenv.config();
import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 3000;

// Start local server if not in a Vercel/serverless environment
// This ensures that Vercel doesn't attempt to start a persistent server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Local development server listening on port ${PORT}`);
    console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
  });
}

// Export for compatibility (though api/index.ts is now the Vercel entry point)
export default app;
