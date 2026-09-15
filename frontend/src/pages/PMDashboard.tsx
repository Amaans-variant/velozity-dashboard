import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchProjects } from '../api/tasks.api';
import { ActivityFeed } from '../components/ActivityFeed';
import { Header } from '../components/Header';
import { CreateProjectForm } from '../components/CreateProjectForm';
import { PageShell, Reveal } from '../components/ui/PageShell';
import { StatCard } from '../components/ui/StatCard';
import { FolderIcon, ChevronRightIcon } from '../components/ui/icons';

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

  if (error)
    return (
      <PageShell>
        <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>
      </PageShell>
    );
  if (!data)
    return (
      <PageShell>
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      </PageShell>
    );

  return (
    <PageShell>
      <Header title="PM Dashboard" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Projects" value={data.projectCount} icon={<FolderIcon className="h-4 w-4" />} />
        <StatCard label="Due this week" value={data.upcomingDueCount} accent="violet" />
      </div>

      <Reveal delay={0.1} className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-display text-sm font-semibold text-ink-100">Your projects</h4>
        </div>
        <CreateProjectForm onCreated={loadProjects} />

        {projects.length === 0 ? (
          <p className="rounded-xl glass-panel px-4 py-6 text-center text-sm text-ink-500">No projects yet, make one above.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="group flex items-center justify-between rounded-xl glass-panel px-4 py-3.5 transition-colors hover:bg-white/[0.06]"
              >
                <div>
                  <p className="text-sm font-medium text-ink-100">{p.name}</p>
                  <p className="text-xs text-ink-500">{p.client?.name}</p>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-ink-700 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-soft" />
              </Link>
            ))}
          </div>
        )}
      </Reveal>

      <Reveal delay={0.15} className="mt-8">
        <ActivityFeed />
      </Reveal>
    </PageShell>
  );
}
