import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { useAuthStore } from './store/authStore';
import { connectSocket, disconnectSocket } from './sockets/socketClient';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    // only connect the socket once we actually HAVE a token - trying to
    // connect before login just gets rejected by the backend's auth
    // handshake anyway (see sockets/index.ts on the backend), so no point
    if (accessToken) {
      connectSocket(accessToken);
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken]);

  // wrapping the whole router in the error boundary, not individual pages.
  // one boundary at the top catches everything below it, way less
  // annoying than wrapping every single page component separately
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
