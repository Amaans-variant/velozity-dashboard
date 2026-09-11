import { useEffect, useState } from 'react';
import { getSocket } from '../sockets/socketClient';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api/tasks.api';
import { Notification } from '../types';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications().then((list: Notification[]) => {
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    });

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
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}>
        🔔 {unreadCount > 0 && <span style={{ background: 'red', color: 'white', borderRadius: '50%', padding: '0 6px', fontSize: 11 }}>{unreadCount}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 30, width: 280, background: 'white', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10 }}>
          <div style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 13 }}>Notifications</strong>
            <button onClick={handleMarkAll} style={{ fontSize: 11 }}>mark all read</button>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 && <p style={{ padding: 8, fontSize: 12, color: '#888' }}>nothing here, go touch grass</p>}
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkOne(n.id)}
                style={{ padding: 8, fontSize: 12, borderBottom: '1px solid #f2f2f2', background: n.isRead ? 'white' : '#f0f7ff', cursor: 'pointer' }}
              >
                {n.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
