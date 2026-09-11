import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { emitTaskActivity } from '../../sockets/events';
import { createNotification } from '../notifications/notification.service';

interface TaskFilters {
  status?: string;
  priority?: string;
  dueBefore?: string;
  dueAfter?: string;
}

// shared where-clause builder for the filter bar (status/priority/duedate)
// these come in as query params so they're shareable URLs, per the brief
function buildFilterWhere(filters: TaskFilters) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.dueBefore || filters.dueAfter) {
    where.dueDate = {};
    if (filters.dueBefore) where.dueDate.lte = new Date(filters.dueBefore);
    if (filters.dueAfter) where.dueDate.gte = new Date(filters.dueAfter);
  }
  return where;
}

export async function createTask(data: {
  title: string;
  description?: string;
  projectId: string;
  assignedToId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string;
}) {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      assignedToId: data.assignedToId,
      priority: data.priority ?? 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });

  // ping the assignee, they should know they got handed something to do
  if (data.assignedToId) {
    await createNotification({
      userId: data.assignedToId,
      type: 'TASK_ASSIGNED',
      message: `You were assigned a new task: "${task.title}"`,
      relatedTaskId: task.id,
    });
  }

  return task;
}

// developer only sees tasks assigned to THEM. not "tasks in their project",
// literally only ones with assignedToId === them. brief is explicit about this
export async function getTasksForDeveloper(userId: string, filters: TaskFilters) {
  return prisma.task.findMany({
    where: { assignedToId: userId, ...buildFilterWhere(filters) },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }], // matches the dev dashboard sort requirement
  });
}

export async function getTasksForProject(
  projectId: string,
  userId: string,
  role: 'ADMIN' | 'PM' | 'DEVELOPER',
  filters: TaskFilters
) {
  // reuse the project ownership check so PMs cant peek at other PM's project tasks
  // by just knowing the projectId (throws 404 if not allowed, same fn as project.service)
  if (role === 'PM') {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.createdById !== userId) {
      throw new ApiError(404, 'Project not found');
    }
  }

  return prisma.task.findMany({
    where: { projectId, ...buildFilterWhere(filters) },
    include: { assignedTo: { select: { id: true, name: true } } },
  });
}

// THE important function. status change -> db log -> socket emit -> notif
export async function updateTaskStatus(
  taskId: string,
  newStatus: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE',
  actingUser: { id: string; name: string; role: 'ADMIN' | 'PM' | 'DEVELOPER' }
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });
  if (!task) throw new ApiError(404, 'Task not found');

  // devs can ONLY touch their own assigned tasks. this is the line from the
  // brief: "developer must not be able to reach a PMs data even with a
  // modified token" - this check is what actually enforces that
  if (actingUser.role === 'DEVELOPER' && task.assignedToId !== actingUser.id) {
    throw new ApiError(403, 'This is not your task to update, nice try tho');
  }
  // PMs can only touch tasks inside projects they created
  if (actingUser.role === 'PM' && task.project.createdById !== actingUser.id) {
    throw new ApiError(403, 'Not your project');
  }

  const fromStatus = task.status;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  // db-backed log, NOT derived/computed later. this is what the missed-events
  // catchup endpoint reads from
  const log = await prisma.taskActivityLog.create({
    data: {
      taskId,
      userId: actingUser.id,
      fromStatus,
      toStatus: newStatus,
    },
  });

  emitTaskActivity(
    {
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      fromStatus,
      toStatus: newStatus,
      changedByName: actingUser.name,
      changedByUserId: actingUser.id,
      timestamp: log.createdAt.toISOString(),
    },
    {
      pmUserId: task.project.createdById,
      assignedToUserId: task.assignedToId,
    }
  );

  // "when a task they own is moved to In Review, the PM receives a notification"
  if (newStatus === 'IN_REVIEW') {
    await createNotification({
      userId: task.project.createdById,
      type: 'TASK_IN_REVIEW',
      message: `"${task.title}" was moved to In Review by ${actingUser.name}`,
      relatedTaskId: task.id,
    });
  }

  return updated;
}
