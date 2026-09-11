import { Server } from 'socket.io';

// just a place to stash the io instance so other files (like task.service)
// can grab it without circular-importing index.ts. classic node problem, classic fix
let ioInstance: Server | null = null;

export function setIo(io: Server) {
  ioInstance = io;
}

export function getIo(): Server {
  if (!ioInstance) throw new Error('Socket.io not initialized yet - did index.ts run?');
  return ioInstance;
}
