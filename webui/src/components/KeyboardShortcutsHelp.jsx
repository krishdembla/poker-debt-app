import React, { useState, useEffect } from 'react';

const KeyboardShortcutsHelp = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible]);

  const shortcuts = [
    { key: 'Ctrl/Cmd + Shift + N', description: 'Create new game' },
    { key: 'Ctrl/Cmd + Shift + A', description: 'Add player' },
    { key: 'Ctrl/Cmd + Shift + S', description: 'Save/Settle debts' },
    { key: 'Ctrl/Cmd + Shift + R', description: 'Refresh' },
    { key: 'Ctrl/Cmd + Shift + T', description: 'Toggle theme' },
    { key: 'Escape', description: 'Go home' },
    { key: 'F5', description: 'Refresh page' }
  ];

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'var(--accent, #ff6b3d)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}
        title="Keyboard Shortcuts"
      >
        ⌨️
      </button>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001
      }}
      onClick={() => setIsVisible(false)} // Close when clicking outside
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-color, white)',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Keyboard Shortcuts</h3>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--text-primary, #333)'
            }}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
        
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {shortcuts.map((shortcut, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <kbd style={{
                backgroundColor: 'var(--border-color, #eee)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'monospace'
              }}>
                {shortcut.key}
              </kbd>
              <span style={{ marginLeft: '1rem' }}>{shortcut.description}</span>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.7 }}>
          <p>💡 Tip: These shortcuts work when you're not typing in input fields.</p>
          <p>💡 Tip: Press <kbd>Esc</kbd> or click outside to close this window.</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp; 