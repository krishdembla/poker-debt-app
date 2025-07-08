import React, { useState, useEffect } from 'react';
import './AddPlayerDialog/AddPlayerDialog.css';

const CreateGameDialog = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState({ title: '', currency: 'USD', date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({ title: '', currency: 'USD', date: new Date().toISOString().slice(0, 10) });
      setIsSubmitting(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.title.trim()) {
      setError('Game name is required');
      return;
    }
    if (!form.currency.trim()) {
      setError('Currency is required');
      return;
    }
    if (!form.date.trim()) {
      setError('Date is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate({ title: form.title.trim(), currency: form.currency.trim(), date: form.date });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create game');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <h3>Create New Game</h3>
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
            <label htmlFor="gameTitle">Game Name</label>
            <input
              id="gameTitle"
              type="text"
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (error) setError(''); }}
              placeholder="Enter game name"
              autoFocus
              required
              className="dialog-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <input
              id="currency"
              type="text"
              value={form.currency}
              onChange={e => { setForm(f => ({ ...f, currency: e.target.value.toUpperCase() })); if (error) setError(''); }}
              placeholder="e.g. USD, INR"
              required
              className="dialog-input"
              maxLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={e => { setForm(f => ({ ...f, date: e.target.value })); if (error) setError(''); }}
              required
              className="dialog-input"
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={!form.title.trim() || !form.currency.trim() || !form.date.trim() || isSubmitting}
              aria-busy={isSubmitting}
            >
              Create Game
            </button>
          </div>
        </form>
        <button
          type="button"
          className="cancel-btn"
          style={{ position: 'absolute', top: 16, right: 16, minWidth: 32, minHeight: 32, borderRadius: '50%', fontSize: '1.2rem', padding: 0 }}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default CreateGameDialog; 