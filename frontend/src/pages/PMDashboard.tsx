import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchProjects } from '../api/tasks.api';
import { ActivityFeed } from '../components/ActivityFeed';
import { NotificationBell } from '../components/NotificationBell';

export default function PMDashboard() {
  const [data, setData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard('pm').then(setData);
    // this only ever returns THIS pm's projects, backend enforces it,
    // frontend doesnt even have to think about it, which is the whole point
    fetchProjects().then(setProjects);
  }, []);

  if (!data) return <p>loading...</p>;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>PM Dashboard</h2>
        <NotificationBell />
      </div>

      <p>{data.projectCount} project(s) · {data.upcomingDueCount} task(s) due this week</p>

      <h4>Your Projects</h4>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link> — {p.client?.name}
          </li>
        ))}
      </ul>

      <ActivityFeed />
    </div>
  );
}
