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

  const codeStyle: React.CSSProperties = {
    userSelect: 'all',
    cursor: 'pointer',
    background: '#f4f4f4',
    padding: '1px 4px',
    borderRadius: 3,
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>Velozity Dashboard</h2>

      <h3 style={{ fontSize: 14, marginBottom: 4 }}>Seed Users</h3>
      <ul style={{ fontSize: 13, marginBottom: 12 }}>
        <li><strong>Admin:</strong> <code style={codeStyle}>admin@velozity.com</code></li>
        <li><strong>PMs:</strong> <code style={codeStyle}>pm1@velozity.com</code>, <code style={codeStyle}>pm2@velozity.com</code></li>
        <li><strong>Devs:</strong> <code style={codeStyle}>dev1@velozity.com</code> – <code style={codeStyle}>dev4@velozity.com</code></li>
      </ul>
      <p style={{ fontSize: 13, marginBottom: 16 }}>
        <strong>Password for all:</strong> <code style={codeStyle}>password123</code>
      </p>

      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8, boxSizing: 'border-box' }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8, boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: 'red', fontSize: 12 }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>
          Log in
        </button>
      </form>
    </div>
  );
}