import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, setToken } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ username, password });
      setToken(res.data.token);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container">
      <div className="brand">ChipMate</div>
      <h3 style={{textAlign:'center', marginBottom:'1rem'}}>Login</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
