import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, setToken } from '../api';

const Register = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(true);
    setForm({ username: '', password: '', confirmPassword: '' });
    setError(null);
    setIsSubmitting(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.username.trim() || !form.password || !form.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await registerUser({ username: form.username, password: form.password });
      setToken(res.data.token);
      setIsOpen(false);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>Register</h3>
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="registerUsername">Username</label>
            <input
              id="registerUsername"
              type="text"
              value={form.username}
              onChange={(e) => {
                setForm(prev => ({ ...prev, username: e.target.value }));
                if (error) setError(null);
              }}
              placeholder="Enter username"
              autoComplete="off"
              autoFocus
              required
              className="dialog-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="registerPassword">Password</label>
            <input
              id="registerPassword"
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm(prev => ({ ...prev, password: e.target.value }));
                if (error) setError(null);
              }}
              placeholder="Enter password"
              autoComplete="new-password"
              required
              className="dialog-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="registerConfirmPassword">Confirm Password</label>
            <input
              id="registerConfirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => {
                setForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                if (error) setError(null);
              }}
              placeholder="Re-enter password"
              autoComplete="new-password"
              required
              className="dialog-input"
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={
                !form.username.trim() ||
                !form.password ||
                !form.confirmPassword ||
                isSubmitting
              }
              aria-busy={isSubmitting}
            >
              Register
            </button>
          </div>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
