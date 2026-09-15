const PALETTE = ['#34e0a1', '#7c6bff', '#4f8ff7', '#f5924a', '#f0576a', '#f5b942'];

function hueFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

// passive presence, not another active "X is typing" alert - the point
// (per Dourish & Bellotti's awareness-and-coordination framing) is that
// knowing who's around should cost the viewer nothing to notice and cost
// the noticed person nothing to broadcast; a quiet ring does that better
// than one more toast
export function Avatar({
  name,
  online,
  size = 32,
}: {
  name: string;
  online?: boolean;
  size?: number;
}) {
  const color = hueFor(name || '?');
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center rounded-full text-[11px] font-semibold text-base-950"
        style={{ background: `linear-gradient(135deg, ${color}, #eef2f6)` }}
        title={name}
      >
        {initials(name || '?')}
      </div>
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-base-900 animate-pulseRing"
          aria-label="online"
        />
      )}
    </div>
  );
}
