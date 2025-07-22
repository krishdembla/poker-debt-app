import { useState, useEffect, createContext } from 'react';
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
import './App.css';

export const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  const [, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Listen for logout and redirect to home
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'poker_token' && !e.newValue) {
        navigate('/');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate]);

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

export default App;