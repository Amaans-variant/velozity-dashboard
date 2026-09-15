import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProject } from '../api/tasks.api';
import { getSocket } from '../sockets/socketClient';
import { FilterBar } from '../components/FilterBar';
import { TaskList } from '../components/TaskList';
import { ActivityFeed } from '../components/ActivityFeed';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { Header } from '../components/Header';
import { PageShell, Reveal } from '../components/ui/PageShell';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchProject(id)
      .then(setProject)
      .catch((err) => setError(err?.response?.data?.message || 'could not load this project'));

    // joins the "project-{id}" socket room for live updates while on this
    // exact page - see backend sockets/index.ts
    const socket = getSocket();
    socket?.emit('project:join', id);
    return () => {
      socket?.emit('project:leave', id);
    };
  }, [id]);

  if (error)
    return (
      <PageShell>
        <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>
      </PageShell>
    );
  if (!project)
    return (
      <PageShell>
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      </PageShell>
    );
  if (!id)
    return (
      <PageShell>
        <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">No project id in the URL.</p>
      </PageShell>
    );

  return (
    <PageShell>
      <Header title={project.name} />
      <p className="-mt-6 mb-6 text-sm text-ink-500">Client: {project.client?.name}</p>

      <Reveal>
        <CreateTaskForm projectId={id} onCreated={() => setRefreshKey((k) => k + 1)} />
        <FilterBar />
        <TaskList projectId={id} refreshKey={refreshKey} />
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <ActivityFeed />
      </Reveal>
    </PageShell>
  );
}
