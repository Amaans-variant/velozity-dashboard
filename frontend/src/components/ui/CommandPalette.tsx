import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { logoutRequest } from '../../api/auth.api';
import { disconnectSocket } from '../../sockets/socketClient';
import { CommandIcon, SearchIcon, XIcon } from './icons';

interface Command {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

// competitor teardown finding worth naming: reviewers repeatedly cite Linear's
// keyboard-first navigation as saving "5-10 minutes a day" versus mouse-driven
// tools like Jira/Asana. this is that idea, dropped into an app that otherwise
// has zero keyboard affordances - press cmd/ctrl+K anywhere post-login
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const commands = useMemo<Command[]>(() => {
    if (!user) return [];
    const base: Command[] = [];

    if (user.role === 'ADMIN') {
      base.push({ id: 'admin', label: 'Go to Admin dashboard', hint: 'Overview', run: () => navigate('/admin') });
    }
    if (user.role === 'PM') {
      base.push({ id: 'pm', label: 'Go to PM dashboard', hint: 'Overview', run: () => navigate('/pm') });
    }
    if (user.role === 'DEVELOPER') {
      base.push({ id: 'dev', label: 'Go to My Tasks', hint: 'Overview', run: () => navigate('/developer') });
    }
    base.push({
      id: 'logout',
      label: 'Log out',
      hint: 'Session',
      run: async () => {
        try {
          await logoutRequest();
        } catch {
          /* still clear locally even if the request fails */
        }
        disconnectSocket();
        clearAuth();
        navigate('/login');
      },
    });
    return base;
  }, [user, navigate, clearAuth]);

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full glass-panel-strong px-4 py-2.5 text-xs text-ink-300 shadow-glow transition-transform hover:-translate-y-0.5 md:flex"
      >
        <CommandIcon className="h-3.5 w-3.5" />
        <span>Command menu</span>
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-base-950/70 backdrop-blur-sm pt-[14vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl glass-panel-strong shadow-panel"
            >
              <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                <SearchIcon className="h-4 w-4 text-ink-500" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Jump to a dashboard, log out..."
                  className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
                />
                <button onClick={() => setOpen(false)} className="text-ink-500 hover:text-ink-100">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {filtered.length === 0 && <p className="px-3 py-4 text-sm text-ink-500">No matching commands.</p>}
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      c.run();
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-ink-100 transition-colors hover:bg-white/8"
                  >
                    <span>{c.label}</span>
                    <span className="text-xs text-ink-500">{c.hint}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
