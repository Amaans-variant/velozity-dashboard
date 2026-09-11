import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { env } from './config/env';
import { setIo } from './lib/socket';
import { initSocket } from './sockets/index';
import { startOverdueTaskJob } from './jobs/overdueTaskChecker';

// wrapping express in a raw http server bc socket.io needs to attach to
// this, not to the express app directly - two diff things under the hood
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

setIo(io);
initSocket(io);
startOverdueTaskJob();

server.listen(env.PORT, () => {
  console.log(`server up on port ${env.PORT}, lfg`);
});
