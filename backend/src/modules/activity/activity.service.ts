import { prisma } from '../../lib/prisma';

// this is the "user was offline, show them what they missed" endpoint.
// note it queries TaskActivityLog directly from the db - not some in-memory
// array of recent events, bc that would vanish on server restart and also
// wouldnt be "last 20 you missed", it'd just be "last 20 since server booted"
export async function getRecentActivity(
  userId: string,
  role: 'ADMIN' | 'PM' | 'DEVELOPER',
  since?: string
) {
  const sinceDate = since ? new Date(since) : undefined;

  // same scoping logic as the socket rooms in sockets/index.ts, just as a
  // db query instead of a room name. keep these two in sync if u ever change one!!
  let where: any = sinceDate ? { createdAt: { gt: sinceDate } } : {};

  if (role === 'ADMIN') {
    // no extra filter, admin sees all
  } else if (role === 'PM') {
    where.task = { project: { createdById: userId } };
  } else {
    // developer - only logs for tasks assigned to them
    where.task = { assignedToId: userId };
  }

  const logs = await prisma.taskActivityLog.findMany({
    where,
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      task: { select: { id: true, title: true, projectId: true } },
      user: { select: { id: true, name: true } },
    },
  });

  // reformat into the "Ravi moved Task #12 from X -> Y" shape the frontend wants
  return logs.map((log) => ({
    id: log.id,
    taskId: log.taskId,
    taskTitle: log.task.title,
    projectId: log.task.projectId,
    fromStatus: log.fromStatus,
    toStatus: log.toStatus,
    changedByName: log.user.name,
    timestamp: log.createdAt.toISOString(),
  }));
}
