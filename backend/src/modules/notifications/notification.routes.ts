import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { listNotifications, readOne, readAll } from './notification.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', listNotifications);
router.patch('/:id/read', readOne);
router.patch('/read-all', readAll);

export default router;
