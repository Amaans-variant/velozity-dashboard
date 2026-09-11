import { useEffect, useState } from 'react';
import { fetchDashboard } from '../api/tasks.api';
import { ActivityFeed } from '../components/ActivityFeed';
import { NotificationBell } from '../components/NotificationBell';
import { getSocket } from '../sockets/socketClient';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [onlineNow, setOnlineNow] = useState(0);

  useEffect(() => {
    fetchDashboard('admin').then((d) => {
      setData(d);
      setOnlineNow(d.onlineNow);
    });

    // "active users online right now" via websocket presence, not a poll
    const socket = getSocket();
    function handlePresence(count: number) {
      setOnlineNow(count);
    }
    socket?.on('presence:count', handlePresence);
    return () => {
      socket?.off('presence:count', handlePresence);
    };
  }, []);

  if (!data) return <p>loading admin dashboard...</p>;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Admin Dashboard</h2>
        <NotificationBell />
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Projects" value={data.totalProjects} />
        <StatCard label="Overdue Tasks" value={data.overdueCount} />
        <StatCard label="Online Now" value={onlineNow} live />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {data.tasksByStatus.map((s: any) => (
          <StatCard key={s.status} label={s.status} value={s._count} />
        ))}
      </div>

      <ActivityFeed />
    </div>
  );
}

function StatCard({ label, value, live }: { label: string; value: number; live?: boolean }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, minWidth: 100 }}>
      <div style={{ fontSize: 24, fontWeight: 'bold' }}>
        {value} {live && <span style={{ fontSize: 10, color: 'green' }}>● live</span>}
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
    </div>
  );
}
