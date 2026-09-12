import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listUsersByRole } from './user.service';

const router = Router();
router.use(authMiddleware); // gotta be logged in to even see the dev list, obviously

// GET /api/users?role=DEVELOPER
// this is literally only used to fill the "assign to" dropdown when
// creating a task. didnt bother locking this to PM/ADMIN only bc theres
// nothing sensitive being returned (just names + roles, see the select:
// in user.service.ts), but flagging that as a conscious choice not laziness
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const role = req.query.role as 'ADMIN' | 'PM' | 'DEVELOPER' | undefined;
    const users = await listUsersByRole(role);
    res.json({ success: true, users });
  })
);

export default router;
