import { Request, Response, NextFunction, RequestHandler } from 'express';

// wraps async route handlers so errors go straight to next() instead of
// crashing the server or making u write try/catch 500 times. ur welcome future me
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
