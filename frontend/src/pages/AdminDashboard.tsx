import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchProjects } from '../api/tasks.api';
import { ActivityFeed } from '../components/ActivityFeed';
import { Header } from '../components/Header';
import { CreateProjectForm } from '../components/CreateProjectForm';
import { getSocket } from '../sockets/socketClient';
import { PageShell, Reveal } from '../components/ui/PageShell';
import { StatCard } from '../components/ui/StatCard';
import { TiltCard } from '../components/ui/TiltCard';
import { OrbitWorkload } from '../components/ui/OrbitWorkload';
import { RoleBadge } from '../components/ui/Badge';
import { FolderIcon, UsersIcon, AlertIcon, ChevronRightIcon } from '../components/ui/icons';

// admin gets full visibility: team roster, every project (not just ones
// they made), and the create-project form since admin is allowed to make
// projects too. data fetching logic is unchanged from the original
export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [onlineNow, setOnlineNow] = useState(0);
  const [error, setError] = useState('');

  function loadProjects() {
    fetchProjects().then(setProjects).catch(() => {});
  }

  useEffect(() => {
    fetchDashboard('admin')
      .then((d) => {
        setData(d);
        setOnlineNow(d.onlineNow);
      })
      .catch((err) => setError(err?.response?.data?.message || 'could not load admin dashboard'));

    loadProjects();

    const socket = getSocket();
    function handlePresence(count: number) {
      setOnlineNow(count);
    }
    socket?.on('presence:count', handlePresence);
    return () => {
      socket?.off('presence:count', handlePresence);
    };
  }, []);

  if (error)
    return (
      <PageShell>
        <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>
      </PageShell>
    );
  if (!data)
    return (
      <PageShell>
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      </PageShell>
    );

  const developers = (data.team || []).filter((u: any) => u.role === 'DEVELOPER');
  const orbitNodes = developers.map((u: any) => ({ id: u.id, name: u.name, count: u._count.assignedTasks || 0 }));

  return (
    <PageShell>
      <Header title="Admin Dashboard" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Projects" value={data.totalProjects} icon={<FolderIcon className="h-4 w-4" />} />
        <StatCard label="Overdue Tasks" value={data.overdueCount} icon={<AlertIcon className="h-4 w-4" />} accent="violet" />
        <StatCard label="Online Now" value={onlineNow} live icon={<UsersIcon className="h-4 w-4" />} />
        {data.tasksByStatus.map((s: any) => (
          <StatCard key={s.status} label={s.status.replace('_', ' ')} value={s._count} />
        ))}
      </div>

      <Reveal delay={0.1} className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TiltCard className="h-full p-5" intensity={4}>
            <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-ink-100">
              <UsersIcon className="h-4 w-4 text-accent-soft" /> Team
            </h4>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white/5 text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium text-right">Projects</th>
                    <th className="px-3 py-2 font-medium text-right">Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.team.map((u: any) => (
                    <tr key={u.id} className="border-t border-white/5 text-ink-300">
                      <td className="px-3 py-2 text-ink-100">{u.name}</td>
                      <td className="px-3 py-2">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-3 py-2 text-right">{u.role === 'PM' ? u._count.createdProjects : '—'}</td>
                      <td className="px-3 py-2 text-right">{u.role === 'DEVELOPER' ? u._count.assignedTasks : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TiltCard>
        </div>

        <div className="lg:col-span-2">
          <TiltCard className="h-full p-5" intensity={6}>
            <h4 className="mb-1 font-display text-sm font-semibold text-ink-100">Workload distribution</h4>
            <p className="mb-2 text-xs text-ink-500">Bigger node = more assigned tasks, at a glance.</p>
            <OrbitWorkload nodes={orbitNodes} />
          </TiltCard>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-display text-sm font-semibold text-ink-100">All projects</h4>
        </div>
        <CreateProjectForm onCreated={loadProjects} />

        {projects.length === 0 ? (
          <p className="rounded-xl glass-panel px-4 py-6 text-center text-sm text-ink-500">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="group flex items-center justify-between rounded-xl glass-panel px-4 py-3.5 transition-colors hover:bg-white/[0.06]"
              >
                <div>
                  <p className="text-sm font-medium text-ink-100">{p.name}</p>
                  <p className="text-xs text-ink-500">{p.client?.name}</p>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-ink-700 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-soft" />
              </Link>
            ))}
          </div>
        )}
      </Reveal>

      <Reveal delay={0.2} className="mt-8">
        <ActivityFeed />
      </Reveal>
    </PageShell>
  );
}
