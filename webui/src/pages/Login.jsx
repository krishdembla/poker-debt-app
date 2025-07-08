import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, setToken } from '../api';
import ThemeToggle from '../components/ThemeToggle';
import './GamePage.css'; // for button styles
import '../App.css'; // for brand font

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ username, password });
      setToken(res.data.token);
      navigate('/games', { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        zIndex: 1,
        background: 'var(--container-bg, #fff)',
        borderRadius: '18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        padding: '2.5rem 2.5rem 2rem 2.5rem',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Brand Logo in Pacifico font */}
        <div className="brand" style={{ marginBottom: '1.2rem', fontSize: '2.7rem', color: 'var(--accent)' }}>
          ChipMate
        </div>
        <div style={{
          color: '#888',
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          fontWeight: 500,
        }}>
          Welcome back! Log in to track your poker debts.
        </div>
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            ⚠️ {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.2rem' }}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="dialog-input"
              style={{ marginBottom: 16, width: '100%' }}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="dialog-input"
              style={{ marginBottom: 16, width: '100%' }}
            />
          </div>
          <button
            type="submit"
            className="settle-button"
            style={{ width: '100%', fontSize: '1.1rem', padding: '0.8rem 0', marginBottom: 8 }}
          >
            Login
          </button>
        </form>
        <p style={{ color: '#888', fontSize: '1rem', marginBottom: 0 }}>
          No account?{' '}
          <span
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => navigate('/register')}
          >
            Register
          </span>
        </p>
        <div style={{ position: 'absolute', top: 18, right: 18 }}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Login;
