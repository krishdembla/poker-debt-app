import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame } from '../api';
import { GameContext } from '../context/GameContext';

const Home = () => {
  const navigate = useNavigate();
  const { setGameId } = useContext(GameContext);

  const handleCreate = async () => {
    const res = await createGame();
    const id = res.data.gameId;
    setGameId(id);
    navigate(`/game/${id}`);
  };

  return (
    <div className="container">
      <h1>Poker Debt Tracker</h1>
      <button onClick={handleCreate}>Create New Game</button>
    </div>
  );
};

export default Home;
