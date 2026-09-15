import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logoutRequest } from '../api/auth.api';
import { disconnectSocket } from '../sockets/socketClient';
import { NotificationBell } from './NotificationBell';
import { Avatar } from './ui/Avatar';
import { RoleBadge } from './ui/Badge';
import { LogOutIcon } from './ui/icons';

// shared header across every page - shows who's logged in (their identity +
// role) so the app never feels anonymous, plus notifications and logout in
// one consistent spot instead of every dashboard rolling its own title bar
export function Header({ title }: { title: string }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // even if this fails, still log them out locally
    }
    disconnectSocket();
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-5">
      <div className="flex items-center gap-3">
        <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet text-sm font-bold text-base-950 sm:flex">
          K
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-100">{title}</h1>
          {user && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
              logged in as <strong className="text-ink-300">{user.name}</strong>
              <RoleBadge role={user.role} />
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && <Avatar name={user.name} online size={30} />}
        <NotificationBell />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-ink-300 transition-colors hover:border-rose-500/30 hover:text-rose-300"
        >
          <LogOutIcon className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    </div>
  );
}
