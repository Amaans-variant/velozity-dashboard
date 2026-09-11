import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getRecentActivity } from './activity.service';

const router = Router();
router.use(authMiddleware);

// GET /api/activity?since=2026-09-11T10:00:00Z
// frontend calls this on load / on reconnect to backfill whatever it missed
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const since = req.query.since as string | undefined;
    const activity = await getRecentActivity(req.user!.id, req.user!.role, since);
    res.json({ success: true, activity });
  })
);

export default router;
