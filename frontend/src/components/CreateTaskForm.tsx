import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchUsersByRole, createTask } from '../api/tasks.api';
import { Button, Input, Select, Textarea } from './ui/Button';
import { PlusIcon } from './ui/icons';

// the button that fixes the biggest functional gap in the original app -
// a PM could look at a project but had no way to hand a developer any work.
// logic untouched, just wrapped in the shared form styling
export function CreateTaskForm({ projectId, onCreated }: { projectId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [devs, setDevs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) fetchUsersByRole('DEVELOPER').then(setDevs);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createTask({
        title,
        description: description || undefined,
        projectId,
        assignedToId: assignedToId || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      setTitle('');
      setDescription('');
      setAssignedToId('');
      setDueDate('');
      setOpen(false);
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "couldn't create the task, double check the fields");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="mb-4">
        <PlusIcon className="h-4 w-4" /> New Task
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-4 overflow-hidden rounded-2xl glass-panel p-4 shadow-panel"
      >
        <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mb-2.5" />

        <Textarea
          placeholder="Description (optional, but helps the dev know what's going on)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mb-2.5"
        />

        <div className="mb-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <Select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
            <option value="">Unassigned</option>
            {devs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>

          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        {error && <p className="mb-2.5 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create task'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}
