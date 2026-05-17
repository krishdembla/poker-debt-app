import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import GamesList from './pages/GamesList';
import Login from './pages/Login';
import Register from './pages/Register';
import RequireAuth from './components/RequireAuth';
import GamePage from './pages/GamePage';
import ConnectionStatus from './components/ConnectionStatus';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const navigate = useNavigate();
  const { logOut } = useAuth();

  // Sync logout across browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'poker_token' && !e.newValue) {
        logOut();
        navigate('/', { replace: true });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate, logOut]);

  return (
    <ErrorBoundary>
      <ConnectionStatus />
      <KeyboardShortcutsHelp />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/games"
          element={
            <RequireAuth>
              <GamesList />
            </RequireAuth>
          }
        />
        <Route
          path="/game/:id"
          element={
            <RequireAuth>
              <GamePage />
            </RequireAuth>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
