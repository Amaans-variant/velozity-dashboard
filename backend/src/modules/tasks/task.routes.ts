import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTaskSchema, updateStatusSchema } from './task.schema';
import { createTaskHandler, listTasksHandler, updateTaskStatusHandler } from './task.controller';

const router = Router();
router.use(authMiddleware);

router.post('/', requireRole('ADMIN', 'PM'), validate(createTaskSchema), createTaskHandler);
router.get('/', listTasksHandler); // all 3 roles can hit this, service layer sorts out what they see
// everyone can PATCH status (dev updates their own, PM/admin can too) -
// the real gate is inside task.service.ts, not here
router.patch('/:id/status', validate(updateStatusSchema), updateTaskStatusHandler);

export default router;
