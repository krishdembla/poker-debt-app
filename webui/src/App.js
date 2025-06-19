import { Routes, Route } from 'react-router-dom';
import GamesList from './pages/GamesList';
import Login from './pages/Login';
import Register from './pages/Register';
import RequireAuth from './components/RequireAuth';
import GamePage from './pages/GamePage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
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
  );
}

export default App;