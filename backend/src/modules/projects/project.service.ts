import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

// IMPORTANT (leaving this comment bc future me WILL forget):
// role middleware only checks "is this person a PM". it has zero clue
// whether the project actually belongs to THIS pm. that logic has to
// live in the query itself, right here, not filtered afterwards in JS.
// filtering in JS means you fetched data you werent supposed to see in
// the first place - the leak already happened at the network level

export async function createProject(name: string, clientId: string, createdById: string) {
  return prisma.project.create({
    data: { name, clientId, createdById },
  });
}

// admin -> all projects. PM -> only theirs. dev doesnt call this at all,
// they use getTasksForDeveloper instead (see task.service)
export async function getProjectsForUser(userId: string, role: 'ADMIN' | 'PM') {
  if (role === 'ADMIN') {
    return prisma.project.findMany({ include: { client: true, tasks: true } });
  }
  // the actual security boundary right here ->
  return prisma.project.findMany({
    where: { createdById: userId },
    include: { client: true, tasks: true },
  });
}

// used when someone tries to GET/PATCH a specific project by id.
// this is what stops a PM from hitting /api/projects/:otherPMsId directly
export async function getProjectByIdForUser(
  projectId: string,
  userId: string,
  role: 'ADMIN' | 'PM'
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true, tasks: true },
  });

  if (!project) throw new ApiError(404, 'Project not found');

  // admin bypasses the ownership check, everyone else has to own it
  if (role !== 'ADMIN' && project.createdById !== userId) {
    // 404 not 403 on purpose - dont even confirm the project exists to
    // someone who has no business knowing that. small detail, good practice
    throw new ApiError(404, 'Project not found');
  }

  return project;
}
