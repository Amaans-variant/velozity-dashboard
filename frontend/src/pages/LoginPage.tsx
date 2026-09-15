import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginRequest } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { GridBackdrop } from '../components/ui/GridBackdrop';
import { ParticleField } from '../components/ui/ParticleField';
import { Button, Input } from '../components/ui/Button';
import { SparkleIcon } from '../components/ui/icons';

const SEED_USERS = [
  { label: 'Admin', email: 'admin@velozity.com' },
  { label: 'PM · Ravi', email: 'pm1@velozity.com' },
  { label: 'PM · Dana', email: 'pm2@velozity.com' },
  { label: 'Dev 1', email: 'dev1@velozity.com' },
  { label: 'Dev 2', email: 'dev2@velozity.com' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@velozity.com'); // prefilled so demoing is faster
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken, user } = await loginRequest(email, password);
      setAuth(user, accessToken);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'PM') navigate('/pm');
      else navigate('/developer');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'login failed, check your credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-ink-100">
      <GridBackdrop variant="hero" />
      <div className="absolute inset-0 opacity-70">
        <ParticleField count={70} />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex items-center gap-2 rounded-full glass-panel px-3 py-1.5 text-xs text-ink-300">
            <SparkleIcon className="h-3.5 w-3.5 text-accent-soft" />
            Real-time delivery command center
          </div>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            <span className="text-gradient">Kinetiq</span>
          </h1>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            One live view of every client, project, and task — built so nothing gets missed and nobody gets buried.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="w-full max-w-sm rounded-2xl glass-panel-strong p-6 shadow-panel"
        >
          <label className="mb-1 block text-xs font-medium text-ink-500">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mb-4"
          />

          <label className="mb-1 block text-xs font-medium text-ink-500">Password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            className="mb-4"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="mt-6 border-t border-white/8 pt-4">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-500">Seeded demo accounts</p>
            <div className="flex flex-wrap gap-1.5">
              {SEED_USERS.map((u) => (
                <button
                  type="button"
                  key={u.email}
                  onClick={() => setEmail(u.email)}
                  className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                    email === u.email ? 'bg-accent/15 text-accent-soft' : 'bg-white/5 text-ink-500 hover:text-ink-100'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-700">
              Password for every seeded account: <code className="text-ink-300">password123</code>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
