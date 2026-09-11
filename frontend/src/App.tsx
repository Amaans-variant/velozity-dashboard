import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { useAuthStore } from './store/authStore';
import { connectSocket, disconnectSocket } from './sockets/socketClient';

export default function App() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    // only connect the socket once we actually have a token. reconnects
    // automatically if the token changes (e.g. after a refresh cycle)
    if (accessToken) {
      connectSocket(accessToken);
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken]);

  return <RouterProvider router={router} />;
}
