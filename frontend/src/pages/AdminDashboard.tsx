import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchProjects } from '../api/tasks.api';
import { ActivityFeed } from '../components/ActivityFeed';
import { Header } from '../components/Header';
import { CreateProjectForm } from '../components/CreateProjectForm';
import { getSocket } from '../sockets/socketClient';

// this used to just be a wall of numbers and a feed - admin couldnt DO
// anything, couldnt even see WHO was on the team or click into a single
// project. felt like watching a dashboard on a wall in someone elses
// office rather than actually being the admin. fixed by adding:
//   1. a real team list (who exists, what role, whats on their plate)
//   2. an actual project list with links, same as PM gets
//   3. the create-project form, since admin is allowed to make projects too
export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [onlineNow, setOnlineNow] = useState(0);
  const [error, setError] = useState('');

  function loadProjects() {
    fetchProjects().then(setProjects).catch(() => {}); // non critical, dont block the whole page over this
  }

  useEffect(() => {
    fetchDashboard('admin')
      .then((d) => {
        setData(d);
        setOnlineNow(d.onlineNow);
      })
      .catch((err) => setError(err?.response?.data?.message || 'could not load admin dashboard'));

    loadProjects();

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

  if (error) return <p style={{ padding: 24, color: 'red' }}>{error}</p>;
  if (!data) return <p style={{ padding: 24 }}>loading admin dashboard...</p>;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <Header title="Admin Dashboard" />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Projects" value={data.totalProjects} />
        <StatCard label="Overdue Tasks" value={data.overdueCount} />
        <StatCard label="Online Now" value={onlineNow} live />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {data.tasksByStatus.map((s: any) => (
          <StatCard key={s.status} label={s.status} value={s._count} />
        ))}
      </div>

      {/* the actual "can see the roles the manager assigned" fix - a real
          list of every user, their role, and what theyre carrying right now */}
      <h4>Team</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 24 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
            <th>Name</th>
            <th>Role</th>
            <th>Projects managed</th>
            <th>Tasks assigned</th>
          </tr>
        </thead>
        <tbody>
          {data.team.map((u: any) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{u.role === 'PM' ? u._count.createdProjects : '—'}</td>
              <td>{u.role === 'DEVELOPER' ? u._count.assignedTasks : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* admin gets the exact same "browse and act on projects" ability PM
          has, since the brief explicitly says admin has full access -
          before this fix admin literally had no way to click into a
          single project from their own dashboard */}
      <h4>All Projects</h4>
      <CreateProjectForm onCreated={loadProjects} />
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link> — {p.client?.name}
          </li>
        ))}
      </ul>
      {projects.length === 0 && <p style={{ color: '#888' }}>no projects yet</p>}

      <div style={{ marginTop: 24 }}>
        <ActivityFeed />
      </div>
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
