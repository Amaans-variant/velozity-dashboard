import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchTasks, updateTaskStatus } from '../api/tasks.api';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { Task, TaskStatus } from '../types';
import { PriorityBadge } from './ui/Badge';
import { Select } from './ui/Button';
import { AlertIcon } from './ui/icons';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const STATUS_ACCENT: Record<TaskStatus, string> = {
  TODO: 'bg-status-todo',
  IN_PROGRESS: 'bg-status-progress',
  IN_REVIEW: 'bg-status-review',
  DONE: 'bg-status-done',
};

// projectId optional - devs dont pass one (backend scopes to "their" tasks),
// PM/admin viewing a project page pass it in. all data fetching/mutation
// logic is unchanged, this only restyles the table as a card list
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
      setLoadError(err?.response?.data?.message || 'could not load tasks, try refreshing');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), projectId, refreshKey]);

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    await updateTaskStatus(taskId, status);
    load();
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }
  if (loadError) return <p className="text-sm text-rose-300">{loadError}</p>;
  if (tasks.length === 0)
    return <p className="rounded-xl glass-panel px-4 py-6 text-center text-sm text-ink-500">No tasks match these filters.</p>;

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {tasks.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl glass-panel px-4 py-3 transition-colors hover:bg-white/[0.06] ${
              t.isOverdue ? 'ring-1 ring-rose-500/30' : ''
            }`}
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${STATUS_ACCENT[t.status]}`} />
            <div className="min-w-[160px] flex-1">
              <p className="text-sm font-medium text-ink-100">{t.title}</p>
              {t.description && <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{t.description}</p>}
            </div>

            <PriorityBadge priority={t.priority} />

            {t.isOverdue && (
              <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-300">
                <AlertIcon className="h-3 w-3" /> overdue
              </span>
            )}

            <span className="text-xs text-ink-500">
              {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}
            </span>

            <Select
              value={t.status}
              onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
              className="w-auto shrink-0"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </Select>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
