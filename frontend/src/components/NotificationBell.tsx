import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getSocket } from '../sockets/socketClient';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api/tasks.api';
import { Notification } from '../types';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications()
      .then((list: Notification[]) => {
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.isRead).length);
      })
      .catch(() => {}); // same deal, dont let a failed fetch nuke the page

    const socket = getSocket();
    if (!socket) return;

    // new notif arrives -> stick it on top of the list
    function handleNew(notif: Notification) {
      setNotifications((prev) => [notif, ...prev]);
    }
    // backend tells us the count directly instead of us recomputing it,
    // keeps frontend dumb which is how i like it at 1am
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

  return (
    <div className="notif-wrap">
      <button onClick={() => setOpen(!open)} className="btn btn-ghost btn-sm">
        🔔 {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-panel card"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 13 }}>Notifications</strong>
              <button onClick={handleMarkAll} className="btn btn-ghost btn-sm">mark all read</button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications.length === 0 && <p className="muted" style={{ padding: 10, fontSize: 12 }}>nothing here, go touch grass</p>}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                  className={`notif-item ${!n.isRead ? 'notif-unread' : ''}`}
                >
                  {n.message}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
