import { useEffect, useState } from 'react';
import { fetchTasks, updateTaskStatus } from '../api/tasks.api';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { Task, TaskStatus } from '../types';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

// projectId is optional - devs dont pass one (backend figures out "their"
// tasks on its own), PM/admin viewing a project page pass it in
export function TaskList({ projectId, refreshKey }: { projectId?: string; refreshKey?: number }) {
  const { filters } = useTaskFilters();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchTasks({ ...filters, projectId });
      setTasks(data);
    } catch (err: any) {
      // this is the "crashes on different pages" bug - an error here used to
      // throw and blow up the whole page. now it just shows a message instead
      setLoadError(err?.response?.data?.message || 'could not load tasks, try refreshing');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // re-fetch whenever filters change (or refreshKey bumps after a create) -
    // this is why the URL-param approach is nice, the effect just watches
    // the serialized filter values
  }, [JSON.stringify(filters), projectId, refreshKey]);

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    // optimistic-ish: just refetch after, not bothering with fancy rollback logic
    // for a take home assessment, thats overkill
    await updateTaskStatus(taskId, status);
    load();
  }

  if (loading) return <p className="muted">loading tasks...</p>;
  if (loadError) return <p className="err-text">{loadError}</p>;
  if (tasks.length === 0) return <p className="muted">no tasks match these filters, congrats i guess?</p>;

  return (
    <table className="table-premium card" style={{ marginBottom: 16 }}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Due</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => (
          <tr key={t.id} className={t.isOverdue ? 'row-overdue' : ''}>
            <td>{t.title}</td>
            <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
            <td>{t.status}{t.isOverdue && <span className="badge badge-overdue">OVERDUE</span>}</td>
            <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
            <td>
              <select value={t.status} onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)} style={{ marginBottom: 0 }}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
