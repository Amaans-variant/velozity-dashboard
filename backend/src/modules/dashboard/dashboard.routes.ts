import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getAdminDashboard, getPmDashboard, getDeveloperDashboard } from './dashboard.service';

const router = Router();
router.use(authMiddleware);

router.get(
  '/admin',
  requireRole('ADMIN'),
  asyncHandler(async (_req, res: Response) => res.json({ success: true, data: await getAdminDashboard() }))
);

router.get(
  '/pm',
  requireRole('PM'),
  asyncHandler(async (req: AuthRequest, res: Response) =>
    res.json({ success: true, data: await getPmDashboard(req.user!.id) })
  )
);

router.get(
  '/developer',
  requireRole('DEVELOPER'),
  asyncHandler(async (req: AuthRequest, res: Response) =>
    res.json({ success: true, data: await getDeveloperDashboard(req.user!.id) })
  )
);

export default router;
