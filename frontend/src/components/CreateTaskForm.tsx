import { useEffect, useState } from 'react';
import { fetchUsersByRole, createTask } from '../api/tasks.api';

// THIS is the button that was missing that actually made the app feel
// broken - a PM could look at a project but had zero way to hand a
// developer any work. like hiring a whole team and never giving them a
// single task. this fixes that, and it's basically the entire point of
// a "project management" tool when u think about it
export function CreateTaskForm({ projectId, onCreated }: { projectId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [devs, setDevs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // was missing before - schema/backend always supported it, form just never asked for it
  const [assignedToId, setAssignedToId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // grab the developer list right when the form opens - reuses the
  // /api/users?role=DEVELOPER endpoint from user.routes.ts on the backend
  useEffect(() => {
    if (open) fetchUsersByRole('DEVELOPER').then(setDevs);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createTask({
        title,
        description: description || undefined, // dont send an empty string, just leave it out entirely
        projectId,
        assignedToId: assignedToId || undefined, // ok to leave unassigned for now
        priority,
        // date input gives u a plain "2026-09-12" string, backend wants
        // full ISO, gotta convert or zod will reject it at the door
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      setTitle('');
      setDescription('');
      setAssignedToId('');
      setDueDate('');
      setOpen(false);
      onCreated(); // parent bumps its refreshKey so TaskList refetches
    } catch (err: any) {
      setError(err?.response?.data?.message || "couldn't create the task, double check the fields");
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>+ New Task</button>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, marginBottom: 16 }}>
      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ display: 'block', marginBottom: 8, padding: 6, width: '100%' }}
      />

      <textarea
        placeholder="Description (optional, but nice to have so the dev knows whats actually going on)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        style={{ display: 'block', marginBottom: 8, padding: 6, width: '100%', fontFamily: 'inherit' }}
      />

      <select
        value={assignedToId}
        onChange={(e) => setAssignedToId(e.target.value)}
        style={{ display: 'block', marginBottom: 8, padding: 6, width: '100%' }}
      >
        <option value="">-- assign to developer (optional for now) --</option>
        {devs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{ display: 'block', marginBottom: 8, padding: 6, width: '100%' }}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ display: 'block', marginBottom: 8, padding: 6, width: '100%' }}
      />

      {error && <p style={{ color: 'red', fontSize: 12 }}>{error}</p>}
      <button type="submit">Create</button>
      <button type="button" onClick={() => setOpen(false)} style={{ marginLeft: 8 }}>Cancel</button>
    </form>
  );
}
