import { useTaskFilters } from '../hooks/useTaskFilters';

// this whole component is just a bunch of dropdowns wired to the URL,
// nothing clever happening, the cleverness is in useTaskFilters.ts
export function FilterBar() {
  const { filters, setFilter } = useTaskFilters();

  return (
    <div className="card" style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
      <select value={filters.status || ''} onChange={(e) => setFilter('status', e.target.value || undefined)} style={{ marginBottom: 0, width: 'auto' }}>
        <option value="">All statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="DONE">Done</option>
      </select>

      <select value={filters.priority || ''} onChange={(e) => setFilter('priority', e.target.value || undefined)} style={{ marginBottom: 0, width: 'auto' }}>
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>

      <input
        type="date"
        value={filters.dueAfter?.slice(0, 10) || ''}
        onChange={(e) => setFilter('dueAfter', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
        title="due after"
        style={{ marginBottom: 0, width: 'auto' }}
      />
      <input
        type="date"
        value={filters.dueBefore?.slice(0, 10) || ''}
        onChange={(e) => setFilter('dueBefore', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
        title="due before"
        style={{ marginBottom: 0, width: 'auto' }}
      />
    </div>
  );
}
