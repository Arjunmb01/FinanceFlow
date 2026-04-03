import { createApp } from '../src/app';

/**
 * Vercel Serverless Entry Point
 * 
 * Vercel natively supports Express apps. By exporting the Express app directly,
 * we ensure the most reliable and efficient request handling in the serverless environment.
 * 
 * This approach avoids double-wrapping and potential timeout issues associated 
 * with serverless-http in this specific runtime.
 */
const app = createApp();

export default app;
