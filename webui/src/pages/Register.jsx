import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, setToken } from '../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser({ username, password });
      setToken(res.data.token);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container">
      <div className="brand">ChipMate</div>
      <h3 style={{textAlign:'center', marginBottom:'1rem'}}>Register</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
