import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createProject, getProjectsForUser, getProjectByIdForUser } from './project.service';

export const createProjectHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, clientId } = req.body;
  const project = await createProject(name, clientId, req.user!.id);
  res.status(201).json({ success: true, project });
});

export const listProjectsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  // role guaranteed ADMIN or PM by the route middleware, TS doesnt know that tho hence the "as"
  const projects = await getProjectsForUser(req.user!.id, req.user!.role as 'ADMIN' | 'PM');
  res.json({ success: true, projects });
});

export const getProjectHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await getProjectByIdForUser(
    req.params.id,
    req.user!.id,
    req.user!.role as 'ADMIN' | 'PM'
  );
  res.json({ success: true, project });
});
