import { NotificationBell } from '../components/NotificationBell';
import { FilterBar } from '../components/FilterBar';
import { TaskList } from '../components/TaskList';
import { ActivityFeed } from '../components/ActivityFeed';

// developer dashboard is the simplest of the 3 - just their own tasks,
// sorted priority then due date (backend does the sorting, see task.service)
export default function DeveloperDashboard() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>My Tasks</h2>
        <NotificationBell />
      </div>

      <FilterBar />
      <TaskList /> {/* no projectId passed - backend already knows to scope to "my tasks" */}

      <div style={{ marginTop: 24 }}>
        <ActivityFeed />
      </div>
    </div>
  );
}
