import { useEffect, useState } from 'react';
import { fetchClients, createClient, createProject } from '../api/tasks.api';

// ok so this component fixes a genuinely embarrassing gap - PMs could VIEW
// projects but there was literally no button anywhere to make a new one.
// kinda like building a whole restaurant and forgetting the front door.
// this also lets u create a brand new client on the fly instead of forcing
// u to go make one separately first, bc who wants to context switch for that
export function CreateProjectForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false); // collapsed by default, dont wanna clutter the page
  const [clients, setClients] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [error, setError] = useState('');

  // only fetch clients once they actually open the form, no point loading
  // stuff nobody asked for yet
  useEffect(() => {
    if (open) fetchClients().then(setClients);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      let finalClientId = clientId;
      // if they typed a brand new client name instead of picking an existing
      // one, create that client first, THEN use its id. two api calls but
      // feels like one smooth action to the user, thats the whole point
      if (!finalClientId && newClientName) {
        const client = await createClient(newClientName);
        finalClientId = client.id;
      }
      if (!finalClientId) {
        setError('pick an existing client or type a new one, cant leave this blank');
        return;
      }
      await createProject(name, finalClientId);
      // reset everything and close - classic "form did its job, get outta here" pattern
      setName('');
      setNewClientName('');
      setClientId('');
      setOpen(false);
      onCreated(); // tell the parent (PMDashboard) to go refetch the list
    } catch (err: any) {
      setError(err?.response?.data?.message || 'something broke creating the project, try again');
    }
  }

  // collapsed state is just a button, dont render the whole form until
  // someone actually wants it
  if (!open) {
    return <button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>+ New Project</button>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, marginBottom: 16 }}>
      <input
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ display: 'block', marginBottom: 8, padding: 6, width: '100%' }}
      />

      <select
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        style={{ display: 'block', marginBottom: 8, padding: 6, width: '100%' }}
      >
        <option value="">-- pick existing client --</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {/* disabled once they've picked an existing client, dont let em do both at once */}
      <input
        placeholder="...or type a brand new client name"
        value={newClientName}
        onChange={(e) => setNewClientName(e.target.value)}
        disabled={!!clientId}
        style={{ display: 'block', marginBottom: 8, padding: 6, width: '100%' }}
      />

      {error && <p style={{ color: 'red', fontSize: 12 }}>{error}</p>}
      <button type="submit">Create</button>
      <button type="button" onClick={() => setOpen(false)} style={{ marginLeft: 8 }}>Cancel</button>
    </form>
  );
}
