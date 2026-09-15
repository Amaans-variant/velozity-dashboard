import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginRequest } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { Scene3D } from '../components/ui/Scene3D';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@velozity.com'); // prefilled so demoing is faster, remove if u want
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { accessToken, user } = await loginRequest(email, password);
      setAuth(user, accessToken);
      // route based on role, could be smarter but this works fine
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'PM') navigate('/pm');
      else navigate('/developer');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'login failed, check ur creds');
    }
  }

  return (
    <div className="login-shell">
      <div className="login-grid">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Scene3D className="hero-canvas" />
          <h1 className="brand" style={{ fontSize: 30, marginTop: 4 }}>Velozity</h1>
          <p className="muted" style={{ marginTop: 4, maxWidth: 380 }}>
            Real-time project delivery, tracked live — task movement, presence and
            activity streamed the moment it happens.
          </p>
        </motion.div>

        <motion.div
          className="card fade-up"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ padding: 28 }}
        >
          <h2 style={{ marginTop: 0 }}>Sign in</h2>

          <h3 style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>Seed Users</h3>
          <ul className="seed-list">
            <li><strong>Admin:</strong> <code>admin@velozity.com</code></li>
            <li><strong>Project Managers:</strong> <code>pm1@velozity.com</code>, <code>pm2@velozity.com</code></li>
            <li><strong>Developers:</strong> <code>dev1@velozity.com</code>, <code>dev2@velozity.com</code></li>
          </ul>
          <p className="muted" style={{ fontSize: 12.5 }}>Global Password: <code style={{ color: 'var(--accent)' }}>password123</code></p>

          <form onSubmit={handleSubmit} style={{ marginTop: 14 }}>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="password"
            />
            {error && <p className="err-text">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Log in
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
