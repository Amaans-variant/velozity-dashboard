import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createTask, getTasksForDeveloper, getTasksForProject, updateTaskStatus } from './task.service';
import { prisma } from '../../lib/prisma';

export const createTaskHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await createTask(req.body);
  res.status(201).json({ success: true, task });
});

// this one branches on role bc "give me my tasks" means smth different
// depending who's asking. kinda ugly but honest about what the brief wants
export const listTasksHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, priority, dueBefore, dueAfter, projectId } = req.query as Record<string, string>;
  const filters = { status, priority, dueBefore, dueAfter };

  if (req.user!.role === 'DEVELOPER') {
    const tasks = await getTasksForDeveloper(req.user!.id, filters);
    return res.json({ success: true, tasks });
  }

  if (!projectId) {
    return res.status(400).json({ success: false, message: 'projectId query param required for PM/Admin' });
  }
  const tasks = await getTasksForProject(projectId, req.user!.id, req.user!.role as any, filters);
  res.json({ success: true, tasks });
});

export const updateTaskStatusHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  // grabbing the user's name for the activity log message ("Ravi moved...")
  // could cache this on the JWT payload instead but eh, one extra query is fine here
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  const task = await updateTaskStatus(req.params.id, req.body.status, {
    id: user.id,
    name: user.name,
    role: user.role,
  });
  res.json({ success: true, task });
});
