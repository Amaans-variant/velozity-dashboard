import { getIo } from '../lib/socket';

interface TaskUpdatePayload {
  taskId: string;
  taskTitle: string;
  projectId: string;
  fromStatus: string | null;
  toStatus: string;
  changedByName: string;
  changedByUserId: string;
  timestamp: string;
}

// call this ONE function whenever a task status changes and it fans out
// to every room that needs to know. this is basically the entire
// "real time role filtered feed" requirement living in one place
export function emitTaskActivity(
  payload: TaskUpdatePayload,
  opts: { pmUserId?: string; assignedToUserId?: string | null }
) {
  const io = getIo();

  // admin sees literally everything, always
  io.to('global-feed').emit('activity:new', payload);

  // anyone currently looking at this exact project's page
  io.to(`project-${payload.projectId}`).emit('activity:new', payload);

  // the PM who owns the project (dont double send if PM IS the one who made the change,
  // doesnt break anything if we do, just avoids a weird "you did this" duplicate toast)
  if (opts.pmUserId) {
    io.to(`pm-${opts.pmUserId}`).emit('activity:new', payload);
  }

  // the developer this task is assigned to
  if (opts.assignedToUserId) {
    io.to(`dev-${opts.assignedToUserId}`).emit('activity:new', payload);
  }
}

export function emitNotification(userId: string, notification: unknown) {
  const io = getIo();
  io.to(`user-${userId}`).emit('notification:new', notification);
}

export function emitUnreadCount(userId: string, count: number) {
  const io = getIo();
  io.to(`user-${userId}`).emit('notification:unreadCount', count);
}
