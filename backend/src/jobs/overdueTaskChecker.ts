import cron from 'node-cron';
import { prisma } from '../lib/prisma';

// runs every 5 mins and does two things:
//   1. flips isOverdue TRUE on anything past its due date that isnt DONE yet
//   2. flips isOverdue back to FALSE on anything thats DONE but still stuck
//      with the flag on from before (this catches old seed data + acts as
//      a backup in case something ever slips past the fix in task.service.ts)
// brief specifically says this must NOT happen on page load (thatd be
// cheating basically, computed-on-read isnt a real "background job")
export function startOverdueTaskJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const flagged = await prisma.task.updateMany({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'DONE' },
          isOverdue: false, // dont re-update ones already flagged, save a write
        },
        data: { isOverdue: true },
      });

      // the "well that shouldnt still be red" cleanup pass
      const cleaned = await prisma.task.updateMany({
        where: { status: 'DONE', isOverdue: true },
        data: { isOverdue: false },
      });

      if (flagged.count > 0) {
        console.log(`[overdue-job] flagged ${flagged.count} task(s) as overdue`);
      }
      if (cleaned.count > 0) {
        console.log(`[overdue-job] cleared the overdue badge on ${cleaned.count} finished task(s)`);
      }
    } catch (err) {
      // dont let a cron failure crash the whole server, just log and move on
      console.error('[overdue-job] failed:', err);
    }
  });

  console.log('overdue task checker cron started (runs every 5 min)');
}
