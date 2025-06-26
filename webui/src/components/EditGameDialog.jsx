import React, { useState, useEffect } from 'react';

const EditGameDialog = ({ open, titleInit, dateInit, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  useEffect(()=>{
    if(open){
      setTitle(titleInit || '');
      setDate(dateInit || '');
    }
  }, [open, titleInit, dateInit]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, date });
  };

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Edit Game</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.2rem' }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Game name" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="outline-btn" onClick={onCancel}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditGameDialog;
