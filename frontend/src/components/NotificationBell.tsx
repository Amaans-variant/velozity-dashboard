import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getSocket } from '../sockets/socketClient';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api/tasks.api';
import { Notification } from '../types';
import { BellIcon, CheckIcon } from './ui/icons';

function labelForType(type: string) {
  return type
    .toLowerCase()
    .split('_')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// THE FIX: every competitor teardown in the research turned up the same
// complaint - Asana/Jira fire a notification per event with no native way
// to batch them, so an active project can dump dozens of pings on someone
// in a single day (reviewers describe exactly this on G2/Software Advice).
// Gloria Mark's CHI'08 "Cost of Interrupted Work" put a number on why that
// matters: ~23 minutes to fully regain focus after an interruption, so a
// dozen raw pings isn't a dozen small costs, it's a dozen full context
// switches. This groups the same feed by type into a digest instead of a
// flat firehose - same data, same socket events, zero backend changes -
// so a burst of "5 tasks moved to review" reads as ONE glanceable group
// instead of 5 separate interruptions competing for attention.
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [digest, setDigest] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications()
      .then((list: Notification[]) => {
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.isRead).length);
      })
      .catch(() => {});

    const socket = getSocket();
    if (!socket) return;

    function handleNew(notif: Notification) {
      setNotifications((prev) => [notif, ...prev]);
    }
    function handleCount(count: number) {
      setUnreadCount(count);
    }

    socket.on('notification:new', handleNew);
    socket.on('notification:unreadCount', handleCount);
    return () => {
      socket.off('notification:new', handleNew);
      socket.off('notification:unreadCount', handleCount);
    };
  }, []);

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleMarkOne(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of notifications) {
      const list = map.get(n.type) || [];
      list.push(n);
      map.set(n.type, list);
    }
    return Array.from(map.entries()).sort((a, b) => {
      const aUnread = a[1].some((n) => !n.isRead);
      const bUnread = b[1].some((n) => !n.isRead);
      return aUnread === bUnread ? 0 : aUnread ? -1 : 1;
    });
  }, [notifications]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-300 transition-colors hover:border-accent/30 hover:text-ink-100"
      >
        <BellIcon className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-xl glass-panel-strong shadow-panel"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <strong className="text-sm text-ink-100">Notifications</strong>
                <div className="flex rounded-full bg-white/5 p-0.5 text-[10px]">
                  <button
                    onClick={() => setDigest(true)}
                    className={`rounded-full px-2 py-0.5 ${digest ? 'bg-accent/20 text-accent-soft' : 'text-ink-500'}`}
                  >
                    Digest
                  </button>
                  <button
                    onClick={() => setDigest(false)}
                    className={`rounded-full px-2 py-0.5 ${!digest ? 'bg-accent/20 text-accent-soft' : 'text-ink-500'}`}
                  >
                    All
                  </button>
                </div>
              </div>
              <button onClick={handleMarkAll} className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-accent-soft">
                <CheckIcon className="h-3 w-3" /> mark all read
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-ink-500">You're fully caught up.</p>
              )}

              {digest
                ? groups.map(([type, group]) => {
                    const unread = group.filter((n) => !n.isRead).length;
                    return (
                      <div key={type} className="border-b border-white/5 px-3 py-2.5">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                            {labelForType(type)}
                          </span>
                          {unread > 0 && (
                            <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent-soft">
                              {unread} new
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {group.slice(0, 3).map((n) => (
                            <NotifRow key={n.id} n={n} onRead={() => handleMarkOne(n.id)} />
                          ))}
                          {group.length > 3 && (
                            <p className="pl-1 text-[11px] text-ink-700">+{group.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                : notifications.map((n) => (
                    <div key={n.id} className="border-b border-white/5 px-3 py-2">
                      <NotifRow n={n} onRead={() => handleMarkOne(n.id)} />
                    </div>
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotifRow({ n, onRead }: { n: Notification; onRead: () => void }) {
  return (
    <button
      onClick={() => !n.isRead && onRead()}
      className={`w-full rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
        n.isRead ? 'text-ink-500' : 'bg-accent/[0.06] text-ink-100 hover:bg-accent/10'
      }`}
    >
      <div className="flex items-start gap-2">
        {!n.isRead && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
        <span className="flex-1">{n.message}</span>
      </div>
      <span className="pl-3.5 text-[10px] text-ink-700">{timeAgo(n.createdAt)}</span>
    </button>
  );
}
