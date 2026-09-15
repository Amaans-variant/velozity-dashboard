import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Terminal, Shield, Cpu } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@velozity.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { accessToken, user } = await loginRequest(email, password);
      setAuth(user, accessToken);
      // add a small delay for the animation effect
      setTimeout(() => {
        if (user.role === 'ADMIN') navigate('/admin');
        else if (user.role === 'PM') navigate('/pm');
        else navigate('/developer');
      }, 600);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed, check your credentials');
      setIsLoading(false);
    }
  }

  // 3D tilt effect on hover for the card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    card.style.transition = 'transform 0.5s ease';
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transition = 'none';
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        className="glass-card"
        style={{ 
          maxWidth: 420, 
          width: '100%', 
          padding: '40px', 
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s ease'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        
        {/* Glow effect behind card content */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(34, 197, 94, 0.2)', filter: 'blur(60px)', borderRadius: '50%', zIndex: -1 }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: 'rgba(20, 184, 166, 0.2)', filter: 'blur(60px)', borderRadius: '50%', zIndex: -1 }} />

        <div style={{ textAlign: 'center', marginBottom: 32, transform: 'translateZ(30px)' }}>
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', marginBottom: 16 }}
          >
            <Shield size={32} color="#22c55e" />
          </motion.div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>Velozity</h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>Enterprise Operations Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ transform: 'translateZ(40px)' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Work Email</label>
            <div style={{ position: 'relative' }}>
              <Terminal size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="premium-input"
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Cpu size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                className="premium-input"
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, marginTop: -8, textAlign: 'center' }}
            >
              {error}
            </motion.p>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="premium-button"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
              />
            ) : (
              'Authenticate Securely'
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', transform: 'translateZ(20px)' }}>
          <h3 style={{ fontSize: 11, marginBottom: 12, textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'center', letterSpacing: '1px' }}>Quick Access (Demo)</h3>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setEmail('admin@velozity.com'); setPassword('password123'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 11, cursor: 'pointer' }}>Admin</button>
            <button onClick={() => { setEmail('pm1@velozity.com'); setPassword('password123'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 11, cursor: 'pointer' }}>PM</button>
            <button onClick={() => { setEmail('dev1@velozity.com'); setPassword('password123'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 11, cursor: 'pointer' }}>Dev</button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}