import { FilterBar } from '../components/FilterBar';
import { TaskList } from '../components/TaskList';
import { ActivityFeed } from '../components/ActivityFeed';
import { Header } from '../components/Header';

// developer dashboard is the simplest of the 3 - just their own tasks,
// sorted priority then due date (backend does the sorting, see task.service).
// swapped the old ad hoc title bar for the shared Header so every page in
// the app now shows "logged in as X · ROLE" consistently, and devs finally
// get a logout button that actually exists somewhere
export default function DeveloperDashboard() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <Header title="My Tasks" />

      <FilterBar />
      <TaskList /> {/* no projectId passed - backend already knows to scope to "my tasks" */}

      <div style={{ marginTop: 24 }}>
        <ActivityFeed />
      </div>
    </div>
  );
}
