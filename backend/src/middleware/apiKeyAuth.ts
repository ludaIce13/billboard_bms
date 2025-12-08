import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config({ override: true });

/**
 * Middleware to validate API key for webhook endpoints
 * API key should be sent in the X-API-Key header
 */
export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  const expectedApiKey = process.env.WEBHOOK_API_KEY;

  if (!expectedApiKey) {
    console.error('WEBHOOK_API_KEY not configured in environment variables');
    return res.status(500).json({
      success: false,
      message: 'API key authentication not properly configured'
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required. Please provide X-API-Key header'
    });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  // API key is valid, proceed to the route handler
  next();
}
