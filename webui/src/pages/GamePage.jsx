import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  addBuyIn,
  removePlayer,
  addCashOut,
  fetchSummary,
  fetchSettlement,
} from '../api';
import AlertBanner from '../components/AlertBanner';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmDialog from '../components/ConfirmDialog';
import { GameContext } from '../context/GameContext';

const getFormatter = (cur) => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur });

const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGameId } = useContext(GameContext);
  const [summary, setSummary] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [title, setTitle] = useState('Game');
  const formatter = getFormatter(currency);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ name: '', amount: '' });
  const [rowInputs, setRowInputs] = useState({});
  const [error, setError] = useState('');
  const [confirm,setConfirm] = useState({open:false,message:'',action:()=>{}});

  useEffect(() => {
    setGameId(id);
    refreshSummary();
    // eslint-disable-next-line
  }, [id]);

  const refreshSummary = async () => {
    const res = await fetchSummary(id);
    setSummary(res.data.summary);
      if (res.data.metadata?.currency) {
        setCurrency(res.data.metadata.currency);
      }
      if (res.data.metadata?.title) {
        setTitle(res.data.metadata.title);
        
      }
      setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, amount } = form;
    if (!name || !amount) return;
    await addBuyIn(id, { name, buyIn: Number(amount) });
    setForm({ name: '', amount: '' });
    refreshSummary();
  };

  const handleSettle = async () => {
    try {
      const res = await fetchSettlement(id);
      setTransactions(res.data.transactions);
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        console.error(err);
        setError('Unexpected error settling debts');
      }
    }
  };

  return (
    <div className="container">
      <div className="brand">ChipMate</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.5rem' }}>
        <button onClick={()=>navigate('/')}>&larr; Home</button>
        <h2 style={{ flex:1, textAlign:'center' }}>{title}</h2>
        <ThemeToggle />
      </div>
      {error && <AlertBanner message={error} onClose={() => setError('')} />}
      

      <form onSubmit={handleSubmit} className="form-inline">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
           placeholder="Buy-In Amount"
           type="number"
           min="0"
           value={form.amount}
           onChange={(e) => setForm({ ...form, amount: e.target.value })}
         />
        <button type="submit" disabled={!form.name || !form.amount || Number(form.amount) <= 0}>Add Player</button>
      </form>

      <h3>Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Buy-Ins</th>
            <th>Cash Out</th>
            <th>Net</th>
            <th style={{width:'140px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{formatter.format(p.totalBuyIn)}</td>
              <td>{p.cashOut != null ? formatter.format(p.cashOut) : '-'}</td>
              <td className={p.net >= 0 ? 'positive' : 'negative'}>{formatter.format(p.net)}</td>
              <td style={{ display:'flex', gap:'0.25rem', flexDirection:'column' }}>
                <div style={{display:'flex', gap:'0.25rem'}}>
                  <input type="number" placeholder="BuyIn" value={rowInputs[p.name]?.buyIn || ''} min="0" style={{width:'6rem'}}
                    onChange={(e)=> setRowInputs({ ...rowInputs, [p.name]: { ...rowInputs[p.name], buyIn: e.target.value } })}/>
                  <button onClick={async ()=> { const amt = Number(rowInputs[p.name]?.buyIn); if(amt>0){ await addBuyIn(id,{ name:p.name, buyIn: amt}); setRowInputs({...rowInputs,[p.name]:{...rowInputs[p.name], buyIn:''}}); refreshSummary(); }}}>
                    +
                  </button>
                </div>
                <div style={{display:'flex', gap:'0.25rem'}}>
                  <input type="number" placeholder="CashOut" value={rowInputs[p.name]?.cashOut || ''} min="0" style={{width:'6rem'}}
                    onChange={(e)=> setRowInputs({ ...rowInputs, [p.name]: { ...rowInputs[p.name], cashOut: e.target.value } })}/>
                  <button onClick={async ()=> { const amt = Number(rowInputs[p.name]?.cashOut); if(!isNaN(amt)){ await addCashOut(id,{ name:p.name, cashOut: amt}); setRowInputs({...rowInputs,[p.name]:{...rowInputs[p.name], cashOut:''}}); refreshSummary(); }}}>
                    ✓
                  </button>
                </div>
                <button onClick={()=> setConfirm({open:true,message:`Remove ${p.name}?`,action: async ()=>{ await removePlayer(id,p.name); refreshSummary(); }})}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleSettle}>Settle Debts</button>

      <ConfirmDialog open={confirm.open} message={confirm.message} onCancel={()=>setConfirm({...confirm,open:false})} onConfirm={async ()=>{ await confirm.action(); setConfirm({...confirm,open:false}); }} />

      {transactions.length > 0 && (
        <div>
          <h3>Transactions</h3>
          <ul className="tx-list">
            {transactions.map((t, idx) => (
              <li key={idx} className="tx-item">
                {t.from} pays {t.to}: <span className="amount">{formatter.format(t.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GamePage;
