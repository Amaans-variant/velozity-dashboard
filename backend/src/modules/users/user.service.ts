import { prisma } from '../../lib/prisma';

// small module, only exists so the frontend can populate "assign this task
// to a developer" dropdowns. not trying to build a whole user management
// system here, thats a different assessment
export async function listUsersByRole(role?: 'ADMIN' | 'PM' | 'DEVELOPER') {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    // NEVER select passwordHash here even by accident. select: explicitly
    // whitelisting fields instead of using include is the easiest way to
    // guarantee that, one typo with include and u leak everyone's hash
    select: { id: true, name: true, role: true },
  });
}
