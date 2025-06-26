import { useEffect, useState, useContext } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmDialog from '../components/ConfirmDialog';
import EditGameDialog from '../components/EditGameDialog';
import { useNavigate } from 'react-router-dom';
import { listGames, createGame, clearToken, deleteGame, renameGame, updateGameDate } from '../api';
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

  const [confirm,setConfirm] = useState({open:false,message:'',action:()=>{}});
  const [edit,setEdit] = useState({open:false,game:null});

  const logout = () => {
    clearToken();
    window.location.href = '/login';
  };

  const handleCreate = async () => {
    const currency = prompt('Currency code (e.g., USD, INR):', 'USD') || 'USD';
    let date = prompt('Date (YYYY-MM-DD, optional):', '');
    if(!date){ date = new Date().toISOString().slice(0,10);}
    const playersStr = prompt('Initial player names (comma separated, optional):', '');
    const players = playersStr ? playersStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const res = await createGame({ currency, date, players });
    setGames([...games, { id: res.data.gameId, title: res.data.title }]);
    open(res.data.gameId);
  };

  return (
    <div className="container">
      <div className="brand">ChipMate</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop:'0.5rem' }}>
        <h2>Your Games</h2>
        <ThemeToggle />
      </div>
      <button onClick={handleCreate}>Create New Game</button>
      <button onClick={logout} style={{ marginLeft: '1rem' }}>Logout</button>
      <ul style={{listStyle:'none', padding:0}}>
        {games.map((g) => (
          <li key={g.id} className="card-item">
            <span style={{ flex:1, fontWeight:600 }}>{g.title}</span>
            <span style={{ fontSize:'0.85rem', opacity:0.8 }}>{new Date(g.date || new Date()).toLocaleDateString()}</span>
            <button style={{padding:'0.3rem 0.5rem'}} onClick={()=> setEdit({open:true,game:g})}>✏️</button>
            <button onClick={() => open(g.id)}>Open</button>
            <button onClick={()=> setConfirm({open:true,message:'Delete this game?',action: async ()=> { await deleteGame(g.id); setGames(games.filter(o=>o.id!==g.id)); }})}>Delete</button>
          </li>
        ))}
      </ul>
          <ConfirmDialog open={confirm.open} message={confirm.message} onCancel={()=>setConfirm({...confirm,open:false})} onConfirm={async ()=>{ await confirm.action(); setConfirm({...confirm,open:false}); }} />
      <EditGameDialog open={edit.open} titleInit={edit.game?.title} dateInit={edit.game?.date} onCancel={()=>setEdit({open:false,game:null})} onSave={async ({title,date})=>{
        if(title!==edit.game.title){ await renameGame(edit.game.id,title); }
        if(date && date!==edit.game.date){ await updateGameDate(edit.game.id,date); }
        setGames(games.map(o=>o.id===edit.game.id?{...o,title,date}:o));
        setEdit({open:false,game:null});
      }} />
    </div>
  );
};

export default GamesList;
