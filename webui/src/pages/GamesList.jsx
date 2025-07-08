import { useEffect, useState, useContext } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmDialog from '../components/ConfirmDialog';
import EditGameDialog from '../components/EditGameDialog';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { listGames, createGame, clearToken, deleteGame, renameGame, updateGameDate } from '../api';
import { GameContext } from '../context/GameContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import CreateGameDialog from '../components/CreateGameDialog';

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
  const { showToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const logout = () => {
    clearToken();
    window.location.href = '/login';
  };

  const handleLogoutClick = () => {
    setLogoutConfirm(true);
  };

  const handleCreate = async (gameData) => {
    const res = await createGame(gameData);
    setGames([...games, { id: res.data.gameId, title: res.data.title, date: gameData.date }]);
    showToast('Game created');
    open(res.data.gameId);
  };

  // Keyboard shortcuts - moved after function definition
  useKeyboardShortcuts({
    onNewGame: () => setCreateOpen(true),
    onRefresh: () => window.location.reload(),
    enabled: true
  });

  return (
    <div className="container">
      <div className="brand">ChipMate</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop:'0.5rem' }}>
        <h2>Your Games</h2>
        <ThemeToggle />
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setCreateOpen(true)}>Create New Game</button>
        <button onClick={handleLogoutClick} style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', fontWeight: 600 }}>Logout</button>
      </div>
      <ul style={{listStyle:'none', padding:0}}>
        {games.map((g) => (
          <li key={g.id} className="card-item">
            <span style={{ flex:1, fontWeight:600 }}>{g.title}</span>
            <span style={{ fontSize:'0.85rem', opacity:0.8 }}>{new Date(g.date || new Date()).toLocaleDateString()}</span>
            <button style={{padding:'0.3rem 0.5rem'}} onClick={()=> setEdit({open:true,game:g})}>✏️</button>
            <button onClick={() => open(g.id)}>Open</button>
            <button onClick={()=> setConfirm({open:true,message:'Delete this game?',action: async ()=> { await deleteGame(g.id); setGames(games.filter(o=>o.id!==g.id)); showToast('Game deleted'); }})}>Delete</button>
          </li>
        ))}
      </ul>
      <ConfirmDialog open={confirm.open} message={confirm.message} onCancel={()=>setConfirm({...confirm,open:false})} onConfirm={async ()=>{ await confirm.action(); setConfirm({...confirm,open:false}); }} />
      <EditGameDialog open={edit.open} titleInit={edit.game?.title} dateInit={edit.game?.date} onCancel={()=>setEdit({open:false,game:null})} onSave={async ({title,date})=>{
        if(title!==edit.game.title){ await renameGame(edit.game.id,title); }
        if(date && date!==edit.game.date){ await updateGameDate(edit.game.id,date); }
        setGames(games.map(o=>o.id===edit.game.id?{...o,title,date}:o));
        showToast('Game updated');
        setEdit({open:false,game:null});
      }} />
      <CreateGameDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      <ConfirmDialog
        open={logoutConfirm}
        message={"Are you sure you want to logout?"}
        onCancel={() => setLogoutConfirm(false)}
        onConfirm={() => { setLogoutConfirm(false); logout(); }}
      />
    </div>
  );
};

export default GamesList;
