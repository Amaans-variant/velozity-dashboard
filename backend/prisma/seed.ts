// run with `npm run seed`. wipes and repopulates, so dont run this on
// anything you actually care about lol
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD = 'password123'; // documented in README, this is fine for a test assessment

async function main() {
  console.log('clearing existing data...');
  // order matters here bc of foreign keys, gotta delete children before parents
  await prisma.notification.deleteMany();
  await prisma.taskActivityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash(PASSWORD, 10);

  console.log('creating users...');
  const admin = await prisma.user.create({
    data: { name: 'Aditi Sharma', email: 'admin@velozity.com', passwordHash: hash, role: 'ADMIN' },
  });

  const pm1 = await prisma.user.create({
    data: { name: 'Ravi Kapoor', email: 'pm1@velozity.com', passwordHash: hash, role: 'PM' },
  });
  const pm2 = await prisma.user.create({
    data: { name: 'Neha Verma', email: 'pm2@velozity.com', passwordHash: hash, role: 'PM' },
  });

  const dev1 = await prisma.user.create({
    data: { name: 'Karan Mehta', email: 'dev1@velozity.com', passwordHash: hash, role: 'DEVELOPER' },
  });
  const dev2 = await prisma.user.create({
    data: { name: 'Priya Nair', email: 'dev2@velozity.com', passwordHash: hash, role: 'DEVELOPER' },
  });
  const dev3 = await prisma.user.create({
    data: { name: 'Arjun Rao', email: 'dev3@velozity.com', passwordHash: hash, role: 'DEVELOPER' },
  });
  const dev4 = await prisma.user.create({
    data: { name: 'Simran Kaur', email: 'dev4@velozity.com', passwordHash: hash, role: 'DEVELOPER' },
  });

  console.log('creating clients...');
  const clientA = await prisma.client.create({ data: { name: 'Nimbus Retail Co.' } });
  const clientB = await prisma.client.create({ data: { name: 'Orbit Fintech' } });
  const clientC = await prisma.client.create({ data: { name: 'Frostbyte Games' } });

  console.log('creating projects...');
  const project1 = await prisma.project.create({
    data: { name: 'Nimbus Storefront Revamp', clientId: clientA.id, createdById: pm1.id },
  });
  const project2 = await prisma.project.create({
    data: { name: 'Orbit Payments API', clientId: clientB.id, createdById: pm1.id },
  });
  const project3 = await prisma.project.create({
    data: { name: 'Frostbyte Launch Site', clientId: clientC.id, createdById: pm2.id },
  });

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // for the "already overdue" ones

  console.log('creating tasks...');
  // project1 tasks - mix of statuses, 2 of these are overdue on purpose
  const t1 = await prisma.task.create({
    data: {
      title: 'Set up product listing page',
      projectId: project1.id,
      assignedToId: dev1.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: inThreeDays,
    },
  });
  const t2 = await prisma.task.create({
    data: {
      title: 'Fix checkout button alignment on mobile',
      projectId: project1.id,
      assignedToId: dev1.id,
      status: 'TODO',
      priority: 'LOW',
      dueDate: lastWeek, // OVERDUE #1 - past due, still not done
      isOverdue: true,
    },
  });
  const t3 = await prisma.task.create({
    data: {
      title: 'Wire up search filters',
      projectId: project1.id,
      assignedToId: dev2.id,
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      dueDate: nextWeek,
    },
  });
  const t4 = await prisma.task.create({
    data: {
      title: 'Add wishlist feature',
      projectId: project1.id,
      assignedToId: dev2.id,
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: yesterday,
    },
  });
  const t5 = await prisma.task.create({
    data: {
      title: 'Write unit tests for cart logic',
      projectId: project1.id,
      assignedToId: dev1.id,
      status: 'TODO',
      priority: 'CRITICAL',
      dueDate: inThreeDays,
    },
  });

  // project2 tasks
  const t6 = await prisma.task.create({
    data: {
      title: 'Implement webhook signature verification',
      projectId: project2.id,
      assignedToId: dev3.id,
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      dueDate: lastWeek, // OVERDUE #2
      isOverdue: true,
    },
  });
  const t7 = await prisma.task.create({
    data: {
      title: 'Add refund endpoint',
      projectId: project2.id,
      assignedToId: dev3.id,
      status: 'TODO',
      priority: 'HIGH',
      dueDate: nextWeek,
    },
  });
  const t8 = await prisma.task.create({
    data: {
      title: 'Rate limit the public API',
      projectId: project2.id,
      assignedToId: dev4.id,
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      dueDate: inThreeDays,
    },
  });
  const t9 = await prisma.task.create({
    data: {
      title: 'Document API endpoints',
      projectId: project2.id,
      assignedToId: dev4.id,
      status: 'DONE',
      priority: 'LOW',
      dueDate: yesterday,
    },
  });
  const t10 = await prisma.task.create({
    data: {
      title: 'Set up staging environment',
      projectId: project2.id,
      assignedToId: dev3.id,
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: nextWeek,
    },
  });

  // project3 tasks (belongs to pm2)
  const t11 = await prisma.task.create({
    data: {
      title: 'Landing page hero animation',
      projectId: project3.id,
      assignedToId: dev4.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: inThreeDays,
    },
  });
  const t12 = await prisma.task.create({
    data: {
      title: 'Newsletter signup integration',
      projectId: project3.id,
      assignedToId: dev2.id,
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: nextWeek,
    },
  });
  await prisma.task.create({
    data: {
      title: 'SEO meta tags pass',
      projectId: project3.id,
      assignedToId: dev4.id,
      status: 'DONE',
      priority: 'LOW',
      dueDate: yesterday,
    },
  });
  await prisma.task.create({
    data: {
      title: 'Trailer video embed',
      projectId: project3.id,
      assignedToId: dev2.id,
      status: 'IN_REVIEW',
      priority: 'HIGH',
      dueDate: inThreeDays,
    },
  });
  await prisma.task.create({
    data: {
      title: 'Press kit download page',
      projectId: project3.id,
      assignedToId: dev4.id,
      status: 'TODO',
      priority: 'LOW',
      dueDate: nextWeek,
    },
  });

  console.log('creating some activity log history so the feed isnt empty on first load...');
  await prisma.taskActivityLog.createMany({
    data: [
      { taskId: t1.id, userId: dev1.id, fromStatus: 'TODO', toStatus: 'IN_PROGRESS' },
      { taskId: t3.id, userId: dev2.id, fromStatus: 'IN_PROGRESS', toStatus: 'IN_REVIEW' },
      { taskId: t4.id, userId: dev2.id, fromStatus: 'IN_REVIEW', toStatus: 'DONE' },
      { taskId: t6.id, userId: dev3.id, fromStatus: 'TODO', toStatus: 'IN_PROGRESS' },
      { taskId: t8.id, userId: dev4.id, fromStatus: 'IN_PROGRESS', toStatus: 'IN_REVIEW' },
      { taskId: t9.id, userId: dev4.id, fromStatus: 'IN_REVIEW', toStatus: 'DONE' },
      { taskId: t11.id, userId: dev4.id, fromStatus: 'TODO', toStatus: 'IN_PROGRESS' },
      { taskId: t12.id, userId: dev2.id, fromStatus: null as any, toStatus: 'TODO' }, // task creation "event"
    ],
  });

  console.log('done! login with any of these (password for all: "password123"):');
  console.log('  admin@velozity.com   (ADMIN)');
  console.log('  pm1@velozity.com     (PM - owns project 1 & 2)');
  console.log('  pm2@velozity.com     (PM - owns project 3)');
  console.log('  dev1@velozity.com .. dev4@velozity.com  (DEVELOPER)');
}

main()
  .catch((e) => {
    console.error('seed script blew up:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
