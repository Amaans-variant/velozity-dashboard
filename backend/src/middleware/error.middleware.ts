import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

// this HAS to be the last app.use() in app.ts or express just ignores it
// (spent 20 mins confused about this once, dont be me)
export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // anything unexpected -> log it server side but never show the raw
  // stack trace to the client, thats a hard requirement from the brief
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our end',
    // only leak details in dev, obviously not in prod
    ...(env.NODE_ENV === 'development' && { debug: String(err) }),
  });
}
