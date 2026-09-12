import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProject } from '../api/tasks.api';
import { getSocket } from '../sockets/socketClient';
import { FilterBar } from '../components/FilterBar';
import { TaskList } from '../components/TaskList';
import { ActivityFeed } from '../components/ActivityFeed';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { Header } from '../components/Header';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // bump this to force TaskList to refetch

  useEffect(() => {
    if (!id) return;
    fetchProject(id)
      .then(setProject)
      .catch((err) => setError(err?.response?.data?.message || 'could not load this project'));

    // gotta join this room specifically so we get LIVE updates while
    // sitting on this exact page - see backend sockets/index.ts, this is
    // the "project-{id}" room that task.service emits to on status change
    const socket = getSocket();
    socket?.emit('project:join', id);
    return () => {
      socket?.emit('project:leave', id);
    };
  }, [id]);

  if (error) return <p style={{ padding: 24, color: 'red' }}>{error}</p>;
  if (!project) return <p style={{ padding: 24 }}>loading project...</p>;
  if (!id) return <p style={{ padding: 24, color: 'red' }}>no project id in the url, something's off</p>;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <Header title={project.name} />
      <p style={{ color: '#666', marginTop: -8 }}>Client: {project.client?.name}</p>

      <CreateTaskForm projectId={id} onCreated={() => setRefreshKey((k) => k + 1)} />

      <FilterBar />
      <TaskList projectId={id} refreshKey={refreshKey} />

      <div style={{ marginTop: 24 }}>
        <ActivityFeed />
      </div>
    </div>
  );
}
