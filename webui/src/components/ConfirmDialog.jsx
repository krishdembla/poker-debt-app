import React from 'react';

const ConfirmDialog = ({ open, message, onConfirm, onCancel, confirmLabel = 'Yes', cancelLabel = 'Cancel' }) => {
  if (!open) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <p style={{ marginBottom: '1.2rem' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onCancel} className="outline-btn">{cancelLabel}</button>
          <button onClick={() => {
            onConfirm();
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
