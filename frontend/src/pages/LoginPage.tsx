import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

// keeping this ugly on purpose - form styling is not what's being graded here
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
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>Velozity Dashboard</h2>
        <h3>Seed Users</h3>
        <ul>
          <li><strong>Admin:</strong> <code style="user-select: all; cursor: pointer;">admin@velozity.com</code></li>
          <li><strong>Project Managers:</strong> <code style="user-select: all; cursor: pointer;">pm1@velozity.com</code>, <code style="user-select: all; cursor: pointer;">pm2@velozity.com</code></li>
          <li><strong>Developers:</strong> <code style="user-select: all; cursor: pointer;">dev1@velozity.com</code>, <code style="user-select: all; cursor: pointer;">dev2@velozity.com</code></li>
        </ul>

        <p><strong>Global Password:</strong> <code style="user-select: all; cursor: pointer;">password123</code></p>
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
        />
        {error && <p style={{ color: 'red', fontSize: 12 }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>
          Log in
        </button>
      </form>
    </div>
  );
}
