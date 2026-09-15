import { useTaskFilters } from '../hooks/useTaskFilters';
import { Select, Input } from './ui/Button';

// still just dropdowns wired to the URL (useTaskFilters owns the logic) -
// this only changes how they look, so filters stay shareable-as-a-URL
export function FilterBar() {
  const { filters, setFilter } = useTaskFilters();

  return (
    <div className="mb-4 flex flex-wrap gap-2 rounded-xl glass-panel p-3">
      <Select
        value={filters.status || ''}
        onChange={(e) => setFilter('status', e.target.value || undefined)}
        className="w-auto"
      >
        <option value="">All statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="DONE">Done</option>
      </Select>

      <Select
        value={filters.priority || ''}
        onChange={(e) => setFilter('priority', e.target.value || undefined)}
        className="w-auto"
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </Select>

      <Input
        type="date"
        value={filters.dueAfter?.slice(0, 10) || ''}
        onChange={(e) => setFilter('dueAfter', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
        title="due after"
        className="w-auto"
      />
      <Input
        type="date"
        value={filters.dueBefore?.slice(0, 10) || ''}
        onChange={(e) => setFilter('dueBefore', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
        title="due before"
        className="w-auto"
      />
    </div>
  );
}
