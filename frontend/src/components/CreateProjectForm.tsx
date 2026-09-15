import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchClients, createClient, createProject } from '../api/tasks.api';
import { Button, Input, Select } from './ui/Button';
import { PlusIcon } from './ui/icons';

// fixes the gap where PMs could view projects but had no way to make one -
// logic is byte-for-byte the same as before, only the markup changed
export function CreateProjectForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) fetchClients().then(setClients);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let finalClientId = clientId;
      if (!finalClientId && newClientName) {
        const client = await createClient(newClientName);
        finalClientId = client.id;
      }
      if (!finalClientId) {
        setError('pick an existing client or type a new one');
        setSubmitting(false);
        return;
      }
      await createProject(name, finalClientId);
      setName('');
      setNewClientName('');
      setClientId('');
      setOpen(false);
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'something broke creating the project, try again');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="mb-4">
        <PlusIcon className="h-4 w-4" /> New Project
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
        <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required className="mb-2.5" />

        <Select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mb-2.5">
          <option value="">-- pick existing client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          placeholder="...or type a brand new client name"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          disabled={!!clientId}
          className="mb-2.5"
        />

        {error && <p className="mb-2.5 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create project'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}
