import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProject } from '../api/tasks.api';
import { getSocket } from '../sockets/socketClient';
import { FilterBar } from '../components/FilterBar';
import { TaskList } from '../components/TaskList';
import { ActivityFeed } from '../components/ActivityFeed';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchProject(id).then(setProject);

    // gotta join this room specifically so we get LIVE updates while
    // sitting on this exact page - see backend sockets/index.ts, this is
    // the "project-{id}" room that task.service emits to on status change
    const socket = getSocket();
    socket?.emit('project:join', id);
    return () => {
      socket?.emit('project:leave', id);
    };
  }, [id]);

  if (!project) return <p>loading project...</p>;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>{project.name}</h2>
      <p style={{ color: '#666' }}>Client: {project.client?.name}</p>

      <FilterBar />
      <TaskList projectId={id} />

      <div style={{ marginTop: 24 }}>
        <ActivityFeed />
      </div>
    </div>
  );
}
