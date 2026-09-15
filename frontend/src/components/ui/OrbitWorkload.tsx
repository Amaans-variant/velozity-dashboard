import { useState } from 'react';

export interface OrbitNode {
  id: string;
  name: string;
  count: number;
}

// a real gap the research turned up: Asana/Jira/Linear reviewers keep
// describing sprint and workload views as "abstract containers" that hide
// who's actually overloaded until standup. this renders assigned-task
// counts as an orbiting ring in true 3D (perspective + rotateY + translateZ,
// no canvas/three.js needed) so the biggest node - the most overloaded dev -
// is visually the most prominent thing on the screen, glanceable in under
// a second instead of buried in a sorted table column
export function OrbitWorkload({ nodes }: { nodes: OrbitNode[] }) {
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  if (nodes.length === 0) {
    return <p className="text-sm text-ink-500">No developers on the team yet.</p>;
  }

  const max = Math.max(...nodes.map((n) => n.count), 1);
  const radius = 120;

  return (
    <div
      className="perspective-1200 relative mx-auto flex h-[280px] w-full max-w-sm items-center justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative h-0 w-0"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'orbitSpin 28s linear infinite',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {nodes.map((n, i) => {
          const angle = (360 / nodes.length) * i;
          const scale = 0.6 + 0.5 * (n.count / max);
          return (
            <div
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `rotateY(${angle}deg) translateZ(${radius}px)` }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered((h) => (h === n.id ? null : h))}
            >
              <div
                className="flex flex-col items-center justify-center rounded-full glass-panel-strong shadow-glow transition-transform duration-300"
                style={{
                  width: 30 + scale * 46,
                  height: 30 + scale * 46,
                  transform: hovered === n.id ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <span className="font-display text-sm font-semibold text-accent-soft">{n.count}</span>
              </div>
              <div className="mt-1 text-center text-[10px] text-ink-500">{n.name.split(' ')[0]}</div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full glass-panel text-[10px] uppercase tracking-wide text-ink-500">
        Load
      </div>
    </div>
  );
}
