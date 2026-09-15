import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatCard({
  label,
  value,
  live,
  icon,
  accent = 'accent',
}: {
  label: string;
  value: number;
  live?: boolean;
  icon?: React.ReactNode;
  accent?: 'accent' | 'violet';
}) {
  const ring = accent === 'violet' ? 'from-violet/25' : 'from-accent/25';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl glass-panel p-5 shadow-panel"
    >
      <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${ring} to-transparent blur-2xl transition-transform duration-500 group-hover:scale-125`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <div className="font-display text-3xl font-semibold text-ink-100">
              <CountUp value={value} />
            </div>
            {live && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-accent-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulseRing" />
                live
              </span>
            )}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wide text-ink-500">{label}</div>
        </div>
        {icon && <div className="rounded-lg bg-white/5 p-2 text-accent-soft">{icon}</div>}
      </div>
    </motion.div>
  );
}
