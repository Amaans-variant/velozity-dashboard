import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

// extending express's Request type so req.user isnt "any" everywhere.
// TS purists will thank me later
export interface AuthRequest extends Request {
  user?: { id: string; role: 'ADMIN' | 'PM' | 'DEVELOPER' };
}

// this is the gatekeeper. no valid access token = no entry, straight up.
// frontend has zero say in this, all enforcement happens right here
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization; // expecting "Bearer <token>"
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    return next(new ApiError(401, 'No token provided, who are u even'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      id: string;
      role: 'ADMIN' | 'PM' | 'DEVELOPER';
    };
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    // covers both expired AND tampered tokens - dont differentiate in the
    // response, that just gives attackers free info
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}
