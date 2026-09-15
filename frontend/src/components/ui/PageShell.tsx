import { motion } from 'framer-motion';
import { GridBackdrop } from './GridBackdrop';
import { CommandPalette } from './CommandPalette';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen text-ink-100">
      <GridBackdrop />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8"
      >
        {children}
      </motion.div>
      <CommandPalette />
    </div>
  );
}

// wraps a section so it animates in as it scrolls into view, instead of
// everything below the fold just being there already - cheap way to make
// long dashboards feel considered instead of dumped on screen
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
