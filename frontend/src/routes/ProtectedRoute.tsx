import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Role } from '../types';
import { motion } from 'framer-motion';

// NOTE: this is just so we dont render the wrong dashboard and confuse
// people visually. it is NOT the security boundary - the API middleware
// is. someone could delete this whole file and the backend would still
// correctly block them. thats the point of "role check at API level"
export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
