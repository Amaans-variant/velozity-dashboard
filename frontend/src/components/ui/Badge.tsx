import { Priority, TaskStatus } from '../../types';

const STATUS_STYLES: Record<TaskStatus, { label: string; dot: string; text: string; bg: string }> = {
  TODO: { label: 'To do', dot: 'bg-status-todo', text: 'text-ink-300', bg: 'bg-white/5' },
  IN_PROGRESS: { label: 'In progress', dot: 'bg-status-progress', text: 'text-blue-200', bg: 'bg-status-progress/10' },
  IN_REVIEW: { label: 'In review', dot: 'bg-status-review', text: 'text-amber-200', bg: 'bg-status-review/10' },
  DONE: { label: 'Done', dot: 'bg-status-done', text: 'text-emerald-200', bg: 'bg-status-done/10' },
};

const PRIORITY_STYLES: Record<Priority, { label: string; text: string; bg: string; ring: string }> = {
  LOW: { label: 'Low', text: 'text-ink-300', bg: 'bg-white/5', ring: 'ring-white/10' },
  MEDIUM: { label: 'Medium', text: 'text-blue-200', bg: 'bg-priority-medium/10', ring: 'ring-priority-medium/30' },
  HIGH: { label: 'High', text: 'text-orange-200', bg: 'bg-priority-high/10', ring: 'ring-priority-high/30' },
  CRITICAL: { label: 'Critical', text: 'text-rose-200', bg: 'bg-priority-critical/10', ring: 'ring-priority-critical/40' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY_STYLES[priority];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${p.bg} ${p.text} ${p.ring}`}>
      {p.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: 'bg-violet/15 text-violet-soft ring-violet/30',
    PM: 'bg-accent/15 text-accent-soft ring-accent/30',
    DEVELOPER: 'bg-white/8 text-ink-300 ring-white/15',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ${colors[role] || colors.DEVELOPER}`}>
      {role}
    </span>
  );
}
