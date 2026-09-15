import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getSocket } from '../sockets/socketClient';
import { fetchMissedActivity } from '../api/tasks.api';
import { ActivityEvent } from '../types';
import { StatusBadge } from './ui/Badge';
import { ActivityIcon } from './ui/icons';

// the heart of the app: catchup fetch on mount (whatever we missed since
// last time, or the last 20 on first ever load), then live over the socket
// for anything new. two sources, one list - unchanged from the original,
// just redressed as a timeline instead of a plain stacked list
export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const lastSeenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    fetchMissedActivity(lastSeenRef.current)
      .then((missed: ActivityEvent[]) => {
        setEvents(missed);
        if (missed.length > 0) lastSeenRef.current = missed[0].timestamp;
      })
      .catch(() => setEvents([]));

    const socket = getSocket();
    if (!socket) return;

    function handleNew(event: ActivityEvent) {
      setEvents((prev) => [event, ...prev].slice(0, 50));
      lastSeenRef.current = event.timestamp;
    }

    socket.on('activity:new', handleNew);
    return () => {
      socket.off('activity:new', handleNew);
    };
  }, []);

  return (
    <div className="rounded-2xl glass-panel p-5 shadow-panel">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent-soft">
          <ActivityIcon className="h-3.5 w-3.5" />
        </div>
        <h4 className="font-display text-sm font-semibold text-ink-100">Live activity</h4>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-ink-500">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulseRing" /> streaming
        </span>
      </div>

      {events.length === 0 && <p className="text-xs text-ink-500">Nothing happening yet — eerily quiet.</p>}

      <div className="max-h-96 space-y-0 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {events.map((ev, i) => (
            <motion.div
              key={ev.id || i}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative border-l border-white/8 pb-4 pl-4 last:pb-0"
            >
              <span className="absolute -left-[3.5px] top-1.5 h-[7px] w-[7px] rounded-full bg-accent" />
              <p className="text-xs leading-relaxed text-ink-300">
                <strong className="text-ink-100">{ev.changedByName}</strong> moved{' '}
                <em className="text-ink-100 not-italic">{ev.taskTitle}</em>
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                {ev.fromStatus && (
                  <>
                    <StatusBadge status={ev.fromStatus} />
                    <span className="text-ink-700">→</span>
                  </>
                )}
                <StatusBadge status={ev.toStatus} />
                <span className="ml-auto text-[10px] text-ink-700">{timeAgo(ev.timestamp)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
