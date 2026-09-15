import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, MouseEvent } from 'react';

// lightweight perspective-tilt on mouse move - no three.js needed for this,
// framer-motion springs are plenty and much cheaper per-card
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}
