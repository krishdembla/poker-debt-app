import { useEffect } from 'react';

export const useKeyboardShortcuts = ({ 
  onNewGame, 
  onAddPlayer, 
  onSettle, 
  onSave, 
  onRefresh,
  onToggleTheme,
  onGoHome,
  enabled = true 
}) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + Shift + N: New Game (avoiding browser's Cmd+N for new tab)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        onNewGame?.();
      }
      
      // Ctrl/Cmd + Shift + A: Add Player (avoiding browser's Cmd+A for select all)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        onAddPlayer?.();
      }
      
      // Ctrl/Cmd + Shift + S: Save/Settle (avoiding browser's Cmd+S for save page)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        onSave?.();
      }
      
      // Ctrl/Cmd + Shift + R: Refresh (avoiding browser's Cmd+R for refresh)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        onRefresh?.();
      }
      
      // Ctrl/Cmd + Shift + T: Toggle Theme (avoiding browser's Cmd+T for new tab)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        onToggleTheme?.();
      }
      
      // Escape: Go Home
      if (event.key === 'Escape') {
        onGoHome?.();
      }
      
      // F5: Refresh
      if (event.key === 'F5') {
        event.preventDefault();
        onRefresh?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onNewGame, onAddPlayer, onSettle, onSave, onRefresh, onToggleTheme, onGoHome]);
}; 