import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { ApiError } from '../utils/ApiError';

// wrap any zod schema and it validates req.body before the controller even
// sees it. frontend validation is not enough per the brief so this is doing
// the real work here
export const validate =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // just grabbing the first error msg, dont need to dump the whole zod tree
      const msg = result.error.errors[0]?.message || 'Invalid request body';
      return next(new ApiError(400, msg));
    }
    req.body = result.data;
    next();
  };
