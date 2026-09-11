import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/ApiError';

// usage: router.get('/admin-only-stuff', authMiddleware, requireRole('ADMIN'), handler)
// NOTE: this only checks the ROLE. it does NOT check ownership (like "is this
// YOUR project"). that part happens inside the service functions with actual
// WHERE clauses. two different jobs, dont mix them up or a dev will be able
// to see another dev's tasks just by having the right role but wrong id
export function requireRole(...allowedRoles: Array<'ADMIN' | 'PM' | 'DEVELOPER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      // shouldnt ever hit this if authMiddleware ran first but just in case
      return next(new ApiError(401, 'Not authenticated'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "nah fam, u don't have access to this"));
    }
    next();
  };
}
