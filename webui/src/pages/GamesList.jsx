import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGames, createGame, clearToken, deleteGame } from '../api';
import { GameContext } from '../context/GameContext';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const { setGameId } = useContext(GameContext);

  useEffect(() => {
    (async () => {
      try {
        const res = await listGames();
        setGames(res.data.games);
      } catch (e) {
        console.error(e);
        setGames([]);
      }
    })();
  }, []);

  const open = (id) => {
    setGameId(id);
    navigate(`/game/${id}`);
  };

    const logout = () => {
    clearToken();
    window.location.href = '/login';
  };

  const handleCreate = async () => {
    const res = await createGame();
    open(res.data.gameId);
  };

  return (
    <div className="container">
      <h1>Your Poker Games</h1>
      <button onClick={handleCreate}>Create New Game</button>
      <button onClick={logout} style={{ marginLeft: '1rem' }}>Logout</button>
      <ul>
        {games.map((id) => (
          <li key={id}>
            {id}
            <button onClick={() => open(id)}>Open</button>
            <button onClick={async () => { await deleteGame(id); setGames(games.filter(g=>g!==id)); }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GamesList;
