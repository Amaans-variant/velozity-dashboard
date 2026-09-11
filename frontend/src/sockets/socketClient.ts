import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// call this once after login (see App.tsx). token goes in `auth`, not a
// query param or header - socket.io has a dedicated spot for this and
// the backend's io.use() middleware reads it from there
export function connectSocket(accessToken: string): Socket {
  if (socket?.connected) return socket;

  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  socket = io(url, {
    auth: { token: accessToken },
  });

  socket.on('connect_error', (err) => {
    // usually means the token expired between page load and socket connect.
    // not bothering with auto-retry-with-refresh here, keeping it simple for now
    console.warn('socket connect failed:', err.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
