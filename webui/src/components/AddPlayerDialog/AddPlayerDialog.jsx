import React, { useState, useEffect } from 'react';
import { validatePlayerName, validateAmount } from '../../utils/apiErrorHandler';
import './AddPlayerDialog.css';

const AddPlayerDialog = ({ isOpen, onClose, onAddPlayer, onError }) => {
  const [form, setForm] = useState({ name: '', amount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', amount: '' });
      setIsSubmitting(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      // Validate inputs
      const validatedName = validatePlayerName(form.name);
      const validatedAmount = validateAmount(form.amount);
      
      setIsSubmitting(true);
      await onAddPlayer({ name: validatedName, amount: validatedAmount });
      onClose();
    } catch (error) {
      console.error('Error adding player:', error);
      // Set error in the dialog
      setError(error.message);
      // Also call onError if provided for parent component
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>Add New Player</h3>
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
            <label htmlFor="playerName">Player Name</label>
            <input
              id="playerName"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm(prev => ({ ...prev, name: e.target.value }));
                if (error) setError(''); // Clear error when user starts typing
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Enter player name"
              autoComplete="off"
              autoFocus
              required
              className="dialog-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="buyInAmount">Buy-In Amount</label>
            <input
              id="buyInAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => {
                setForm(prev => ({ ...prev, amount: e.target.value }));
                if (error) setError(''); // Clear error when user starts typing
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Enter buy-in amount"
              autoComplete="off"
              required
              className="dialog-input"
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!form.name.trim() || !form.amount || Number(form.amount) <= 0 || isSubmitting}
              aria-busy={isSubmitting}
            >
              Add Player
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlayerDialog;
