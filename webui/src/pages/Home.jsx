import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './GamePage.css'; // for button styles
import '../App.css'; // for brand font

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="home-card" style={{
        zIndex: 1,
        background: 'rgba(34, 40, 49, 0.97)',
        borderRadius: '24px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
        padding: '2.5rem 1.5rem 2rem 1.5rem',
        maxWidth: 420,
        minWidth: 0,
        minHeight: '65vh',
        width: '95vw',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Brand Logo in Pacifico font */}
        <div className="brand" style={{ marginBottom: '1.6rem', fontSize: '3.2rem', color: 'var(--accent)' }}>
          ChipMate
        </div>
        <div style={{
          color: '#ffbfa3',
          fontSize: '1.35rem',
          marginBottom: '2.2rem',
          fontWeight: 600,
        }}>
          Track Poker Debts. Settle Up. Play More.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '2.2rem', flexWrap: 'wrap' }}>
          <button className="settle-button" style={{ minWidth: 150, fontSize: '1.15rem', padding: '1rem 0' }} onClick={() => navigate('/login')}>Login</button>
          <button className="settle-button" style={{ minWidth: 150, background: 'var(--primary-color, #007bff)', fontSize: '1.15rem', padding: '1rem 0' }} onClick={() => navigate('/register')}>Register</button>
        </div>
        <div className="home-features-row" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.2rem',
          marginBottom: '2.2rem',
          color: '#fff',
          fontSize: '1.18rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span role="img" aria-label="calculator">🧮</span> Easy buy-in & cash-out
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span role="img" aria-label="handshake">🤝</span> Instant settlement
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span role="img" aria-label="lock">🔒</span> Secure & private
          </div>
        </div>
        <div style={{ position: 'absolute', top: 18, right: 18 }}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Home;
