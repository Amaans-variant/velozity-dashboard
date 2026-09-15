import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// real 3D, not a fake box-shadow trick: the card lives inside a perspective
// container and rotates on rotateX/rotateY driven by pointer position,
// spring-damped so it settles instead of snapping. this is the kind of
// micro-interaction that's cheap to describe and easy to get wrong -
// most half-hearted implementations skip the spring and it just feels janky
export function TiltCard({
  children,
  className = '',
  intensity = 10,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 220,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 220,
    damping: 20,
  });
  const glowX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);
  const glowBackground = useTransform([glowX, glowY], (latest) => {
    const [gx, gy] = latest as [string, string];
    return `radial-gradient(280px circle at ${gx} ${gy}, rgba(52,224,161,0.14), transparent 70%)`;
  });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="perspective-1200 group">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`relative rounded-2xl glass-panel shadow-panel ${className}`}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glowBackground }}
        />
        <div style={{ transform: 'translateZ(24px)' }}>{children}</div>
      </motion.div>
    </div>
  );
}
