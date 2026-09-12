import { useEffect, useState, useRef } from 'react';
import { getSocket } from '../sockets/socketClient';
import { fetchMissedActivity } from '../api/tasks.api';
import { ActivityEvent } from '../types';

// this component is basically the heart of the whole assignment.
// flow: on mount, fetch whatever we missed since last time (or last 20 if
// first ever load) from the DB, THEN start listening live over the socket
// for anything new. two different data sources, same list
export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const lastSeenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // catchup first - wrapped in catch so a flaky backend call doesnt
    // white-screen whatever page this feed is sitting on
    fetchMissedActivity(lastSeenRef.current)
      .then((missed: ActivityEvent[]) => {
        setEvents(missed); // already ordered newest-first by the backend
        if (missed.length > 0) lastSeenRef.current = missed[0].timestamp;
      })
      .catch(() => setEvents([])); // fail quiet, feed just shows empty instead of crashing

    const socket = getSocket();
    if (!socket) return; // shouldnt happen if connectSocket ran after login but just in case

    function handleNew(event: ActivityEvent) {
      setEvents((prev) => [event, ...prev].slice(0, 50)); // cap it, dont let this grow forever
      lastSeenRef.current = event.timestamp;
    }

    socket.on('activity:new', handleNew);
    return () => {
      socket.off('activity:new', handleNew);
    };
  }, []);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, maxHeight: 400, overflowY: 'auto' }}>
      <h4 style={{ marginTop: 0 }}>Live Activity</h4>
      {events.length === 0 && <p style={{ color: '#888', fontSize: 13 }}>nothing happening yet... eerily quiet</p>}
      {events.map((ev, i) => (
        <div key={ev.id || i} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #eee' }}>
          <strong>{ev.changedByName}</strong> moved <em>{ev.taskTitle}</em> from{' '}
          {ev.fromStatus ?? 'nothing'} → {ev.toStatus} · {timeAgo(ev.timestamp)}
        </div>
      ))}
    </div>
  );
}

// quick and dirty relative time, not pulling in a whole library for this
function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
