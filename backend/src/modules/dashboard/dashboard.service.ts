import { prisma } from '../../lib/prisma';
import { getOnlineCount } from '../../sockets/presence';

export async function getAdminDashboard() {
  // Promise.all bc none of these depend on each other, no reason to wait in sequence
  const [totalProjects, tasksByStatus, overdueCount, team] = await Promise.all([
    prisma.project.count(),
    prisma.task.groupBy({ by: ['status'], _count: true }),
    prisma.task.count({ where: { isOverdue: true } }),
    // THIS is the actual fix for "admin cant see the roles the manager
    // assigned" - before this, admin only got numbers, never an actual
    // list of who exists and what theyre carrying. _count here rides on
    // prisma's relations (assignedTasks for devs, createdProjects for PMs)
    // so its one query instead of n+1 queries counting each user by hand
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        _count: { select: { assignedTasks: true, createdProjects: true } },
      },
      orderBy: { role: 'asc' }, // groups ADMIN/DEVELOPER/PM together instead of random order
    }),
  ]);

  return {
    totalProjects,
    tasksByStatus, // e.g. [{status:'TODO', _count: 12}, ...] - frontend can chart this or w/e
    overdueCount,
    onlineNow: getOnlineCount(), // live presence count, this is the websocket-powered bit
    team, // [{id, name, role, _count:{assignedTasks, createdProjects}}, ...] - this is admin's actual visibility into the team
  };
}

export async function getPmDashboard(pmId: string) {
  const projects = await prisma.project.findMany({
    where: { createdById: pmId },
    include: { tasks: true },
  });

  const allTasks = projects.flatMap((p) => p.tasks);
  const tasksByPriority: Record<string, number> = {};
  for (const t of allTasks) {
    tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
  }

  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const upcomingDue = allTasks.filter(
    (t) => t.dueDate && t.dueDate <= weekFromNow && t.dueDate >= new Date()
  );

  return {
    projectCount: projects.length,
    tasksByPriority,
    upcomingDueCount: upcomingDue.length,
    upcomingDue, // sending the actual list too, frontend can decide how much to show
  };
}

export async function getDeveloperDashboard(devId: string) {
  const tasks = await prisma.task.findMany({
    where: { assignedToId: devId },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  });
  return { tasks, count: tasks.length };
}
