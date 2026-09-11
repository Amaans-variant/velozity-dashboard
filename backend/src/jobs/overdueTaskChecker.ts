import cron from 'node-cron';
import { prisma } from '../lib/prisma';

// runs every 5 mins and flips isOverdue on anything past its due date that
// isnt already DONE. brief specifically says this must NOT happen on page
// load (that'd be cheating basically, computed-on-read isnt a "background job")
export function startOverdueTaskJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const result = await prisma.task.updateMany({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'DONE' },
          isOverdue: false, // dont re-update ones already flagged, save a write
        },
        data: { isOverdue: true },
      });
      if (result.count > 0) {
        console.log(`[overdue-job] flagged ${result.count} task(s) as overdue`);
      }
    } catch (err) {
      // dont let a cron failure crash the whole server, just log and move on
      console.error('[overdue-job] failed:', err);
    }
  });

  console.log('overdue task checker cron started (runs every 5 min)');
}
