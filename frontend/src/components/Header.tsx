import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logoutRequest } from '../api/auth.api';
import { disconnectSocket } from '../sockets/socketClient';
import { NotificationBell } from './NotificationBell';

// this didnt exist before - there was literally no logout button anywhere
// in the entire app, and every dashboard rolled its own little "title +
// bell icon" bar with slightly different styling. one shared header fixes
// both: consistent look across every page (the "order" thing), AND it
// shows who's actually logged in so a random name showing up in the
// activity feed ("Ravi moved...") at least has SOME context - u can see
// ur own identity is Ravi/PM/whatever right at the top, every single page
export function Header({ title }: { title: string }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutRequest(); // tells the backend to revoke the refresh token
    } catch {
      // even if this fails (server down, whatever) still log them out
      // locally, no point trapping someone who wants to leave
    }
    disconnectSocket();
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="header-bar glass fade-up">
      <div>
        <h2 className="brand">{title}</h2>
        {/* this little line is basically the "profile system" - not a
            whole page, just enough context so u always know whos logged
            in and what they can do, instead of the app feeling anonymous */}
        {user && (
          <p className="brand-sub">
            logged in as <strong>{user.name}</strong> · {user.role}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <NotificationBell />
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">Log out</button>
      </div>
    </div>
  );
}
