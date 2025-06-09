import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [ping, setPing] = useState('');

  useEffect(() => {
    fetch('http://localhost:5050/api/ping')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setPing(data.message))
      .catch((err) => {
        console.error('Error fetching from backend:', err);
        setPing('Error');
      });
  }, []);

  return (
    <div className="App">
      <h1>Poker Debt Tracker</h1>
      <p>Backend says: {ping}</p>
    </div>
  );
}

export default App;