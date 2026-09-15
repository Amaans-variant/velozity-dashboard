import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchProjects } from '../api/tasks.api';
import { ActivityFeed } from '../components/ActivityFeed';
import { Header } from '../components/Header';
import { CreateProjectForm } from '../components/CreateProjectForm';
import { Reveal } from '../components/ui/Reveal';

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

  if (error) return <p className="page err-text">{error}</p>;
  if (!data) return <p className="page muted">loading...</p>;

  return (
    <div className="page">
      <Header title="PM Dashboard" />

      <p className="muted fade-up">{data.projectCount} project(s) · {data.upcomingDueCount} task(s) due this week</p>

      <Reveal>
        <h4>Your Projects</h4>
        <CreateProjectForm onCreated={loadProjects} />
        <ul className="link-list">
          {projects.map((p) => (
            <li key={p.id} className="card card-hover">
              <Link to={`/projects/${p.id}`}>{p.name}</Link> — {p.client?.name}
            </li>
          ))}
        </ul>
        {projects.length === 0 && <p className="muted">no projects yet, make one above</p>}
      </Reveal>

      <Reveal delay={0.05}>
        <div style={{ marginTop: 24 }}>
          <ActivityFeed />
        </div>
      </Reveal>
    </div>
  );
}
