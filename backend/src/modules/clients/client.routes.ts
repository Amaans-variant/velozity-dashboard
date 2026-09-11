import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { createClient, listClients } from './client.service';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (_req, res: Response) => res.json({ success: true, clients: await listClients() })));
router.post(
  '/',
  requireRole('ADMIN', 'PM'),
  asyncHandler(async (req: AuthRequest, res: Response) =>
    res.status(201).json({ success: true, client: await createClient(req.body.name) })
  )
);

export default router;
