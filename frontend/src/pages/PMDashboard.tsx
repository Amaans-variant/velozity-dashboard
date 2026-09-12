import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchProjects } from '../api/tasks.api';
import { ActivityFeed } from '../components/ActivityFeed';
import { NotificationBell } from '../components/NotificationBell';
import { CreateProjectForm } from '../components/CreateProjectForm';

export default function PMDashboard() {
  const [data, setData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState('');

  function loadProjects() {
    fetchProjects().then(setProjects).catch(() => setError('could not load projects'));
  }

  useEffect(() => {
    fetchDashboard('pm').then(setData).catch(() => setError('could not load dashboard'));
    loadProjects();
  }, []);

  if (error) return <p style={{ padding: 24, color: 'red' }}>{error}</p>;
  if (!data) return <p style={{ padding: 24 }}>loading...</p>;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>PM Dashboard</h2>
        <NotificationBell />
      </div>

      <p>{data.projectCount} project(s) · {data.upcomingDueCount} task(s) due this week</p>

      <h4>Your Projects</h4>
      <CreateProjectForm onCreated={loadProjects} />
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link> — {p.client?.name}
          </li>
        ))}
      </ul>
      {projects.length === 0 && <p style={{ color: '#888' }}>no projects yet, make one above</p>}

      <div style={{ marginTop: 24 }}>
        <ActivityFeed />
      </div>
    </div>
  );
}
