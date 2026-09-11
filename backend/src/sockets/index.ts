import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { addOnlineUser, removeOnlineUser, getOnlineCount } from './presence';

interface SocketWithUser extends Socket {
  userId?: string;
  role?: string;
}

// this is the room strategy, worth remembering bc its the whole point of
// the "role filtered feed" requirement:
//   - admin        -> joins "global-feed"           (sees EVERYTHING)
//   - PM            -> joins "pm-<their id>"          (only their own projects get emitted here)
//   - developer     -> joins "dev-<their id>"          (only their assigned tasks)
//   - anyone on a project page -> also joins "project-<id>" for live updates while looking at it
// task.service.ts decides WHO to emit to when a status changes, this file
// just handles ppl joining the right rooms in the first place
export function initSocket(io: Server) {
  io.use((socket: SocketWithUser, next) => {
    // socket auth handshake - token comes in via socket.handshake.auth.token
    // (frontend sends it when calling io() - see socketClient.ts)
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No auth token, get outta here'));

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        id: string;
        role: string;
      };
      socket.userId = payload.id;
      socket.role = payload.role;
      next();
    } catch {
      next(new Error('Bad token'));
    }
  });

  io.on('connection', (socket: SocketWithUser) => {
    const { userId, role } = socket;
    if (!userId || !role) return; // TS makes me check this even tho middleware guarantees it, whatever

    // auto join the role-based room on connect
    if (role === 'ADMIN') socket.join('global-feed');
    if (role === 'PM') socket.join(`pm-${userId}`);
    if (role === 'DEVELOPER') socket.join(`dev-${userId}`);

    // every user also gets their own personal room for notifications
    // (separate concern from the activity feed rooms above)
    socket.join(`user-${userId}`);

    addOnlineUser(userId);
    io.to('global-feed').emit('presence:count', getOnlineCount());

    // frontend calls this when opening a specific project's detail page
    socket.on('project:join', (projectId: string) => {
      socket.join(`project-${projectId}`);
    });
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project-${projectId}`);
    });

    socket.on('disconnect', () => {
      removeOnlineUser(userId);
      io.to('global-feed').emit('presence:count', getOnlineCount());
    });
  });
}
