import serverless from 'serverless-http';
import { createApp } from '../src/app';

const app = createApp();

/**
 * Vercel Serverless Handler
 * Wraps the Express app using serverless-http to ensure consistent behavior
 * across local and production environments.
 */
const dynamicHandler = serverless(app);

export default async (req: any, res: any) => {
  // Add a small delay if needed or other serverless-specific logic here
  return await dynamicHandler(req, res);
};
