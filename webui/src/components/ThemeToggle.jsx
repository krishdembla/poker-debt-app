import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <button onClick={toggle} style={{ marginLeft: '1rem' }}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};

export default ThemeToggle;
