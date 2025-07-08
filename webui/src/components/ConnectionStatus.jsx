import React, { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for WebSocket connection status
  useEffect(() => {
    const checkWebSocketStatus = () => {
      // This would be connected to the WebSocket context
      // For now, we'll just show the network status
    };

    const interval = setInterval(checkWebSocketStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#f44336',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      ⚠️ Offline Mode
    </div>
  );
};

export default ConnectionStatus; 