import { FilterBar } from '../components/FilterBar';
import { TaskList } from '../components/TaskList';
import { ActivityFeed } from '../components/ActivityFeed';
import { Header } from '../components/Header';
import { PageShell, Reveal } from '../components/ui/PageShell';

// simplest of the three dashboards - just the developer's own tasks,
// sorted priority then due date server-side. no projectId passed, backend
// already knows to scope to "my tasks"
export default function DeveloperDashboard() {
  return (
    <PageShell>
      <Header title="My Tasks" />
      <Reveal>
        <FilterBar />
        <TaskList />
      </Reveal>
      <Reveal delay={0.1} className="mt-8">
        <ActivityFeed />
      </Reveal>
    </PageShell>
  );
}
