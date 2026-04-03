import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation Error', details: err.errors });
  }

  if (
    err.message === 'Email not registered' || 
    err.message === 'Incorrect password' || 
    err.message === 'Invalid credentials' || 
    err.message === 'Unauthorized' || 
    err.message === 'Forbidden'
  ) {
    return res.status(err.message === 'Forbidden' ? 403 : 401).json({ error: err.message });
  }

  if (err.message === 'User not found' || err.message === 'Record not found' || err.message === 'Account inactive') {
    return res.status(err.message === 'Account inactive' ? 403 : 404).json({ error: err.message });
  }

  if (err.message === 'Email already in use') {
    return res.status(409).json({ error: err.message });
  }

  // Fallback for unexpected errors
  res.status(500).json({ error: err.message || 'Internal Server Error' });
};
