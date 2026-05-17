import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import './GamePage.css';
import '../App.css';

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logIn } = useAuth();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await registerUser({ username: form.username, password: form.password });
      logIn(res.data.token);
      navigate('/games', { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
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
        <div className="brand" style={{ marginBottom: '1.2rem', fontSize: '2.7rem', color: 'var(--accent)' }}>
          ChipMate
        </div>
        <div style={{ color: '#888', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500 }}>
          Create an account to start tracking debts.
        </div>
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.2rem' }}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange('username')}
              autoComplete="username"
              autoFocus
              required
              className="dialog-input"
              style={{ marginBottom: 16, width: '100%' }}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password (8+ chars, at least 1 number)"
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
              required
              className="dialog-input"
              style={{ marginBottom: 16, width: '100%' }}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              autoComplete="new-password"
              required
              className="dialog-input"
              style={{ marginBottom: 16, width: '100%' }}
            />
          </div>
          <button
            type="submit"
            className="settle-button"
            disabled={!form.username.trim() || !form.password || !form.confirmPassword || isSubmitting}
            style={{ width: '100%', fontSize: '1.1rem', padding: '0.8rem 0', marginBottom: 8 }}
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={{ color: '#888', fontSize: '1rem', marginBottom: 0 }}>
          Already have an account?{' '}
          <span
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
        <div style={{ position: 'absolute', top: 18, right: 18 }}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Register;
