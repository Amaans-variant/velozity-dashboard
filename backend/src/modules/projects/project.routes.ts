import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createProjectSchema } from './project.schema';
import { createProjectHandler, listProjectsHandler, getProjectHandler } from './project.controller';

const router = Router();

router.use(authMiddleware); // every route below needs a valid login, no exceptions

// developers dont manage projects at all per the brief, so ADMIN + PM only
router.post('/', requireRole('ADMIN', 'PM'), validate(createProjectSchema), createProjectHandler);
router.get('/', requireRole('ADMIN', 'PM'), listProjectsHandler);
router.get('/:id', requireRole('ADMIN', 'PM'), getProjectHandler);

export default router;
