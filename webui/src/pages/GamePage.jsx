import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addBuyIn,
  addCashOut,
  fetchSummary,
  fetchSettlement,
} from '../api';
import { GameContext } from '../context/GameContext';

const GamePage = () => {
  const { id } = useParams();
  const { setGameId } = useContext(GameContext);
  const [summary, setSummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ name: '', amount: '', type: 'buyin' });

  useEffect(() => {
    setGameId(id);
    refreshSummary();
    // eslint-disable-next-line
  }, [id]);

  const refreshSummary = async () => {
    const res = await fetchSummary(id);
    setSummary(res.data.summary);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, amount, type } = form;
    if (!name || !amount) return;
    if (type === 'buyin') await addBuyIn(id, { name, buyIn: Number(amount) });
    else await addCashOut(id, { name, cashOut: Number(amount) });
    setForm({ ...form, amount: '' });
    refreshSummary();
  };

  const handleSettle = async () => {
    try {
      const res = await fetchSettlement(id);
      setTransactions(res.data.transactions);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(err.response.data.error);
      } else {
        console.error(err);
        alert('Error settling debts');
      }
    }
  };

  return (
    <div className="container">
      <h2>Game {id}</h2>

      <form onSubmit={handleSubmit} className="form-inline">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Amount"
          type="number"
          min="0"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="buyin">Buy-In</option>
          <option value="cashout">Cash-Out</option>
        </select>
        <button type="submit">Add</button>
      </form>

      <h3>Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Buy-Ins</th>
            <th>Cash Out</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{p.totalBuyIn}</td>
              <td>{p.cashOut}</td>
              <td className={p.net >= 0 ? 'positive' : 'negative'}>{p.net}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleSettle}>Settle Debts</button>

      {transactions.length > 0 && (
        <div>
          <h3>Transactions</h3>
          <ul className="tx-list">
            {transactions.map((t, idx) => (
              <li key={idx} className="tx-item">
                {t.from} pays {t.to}: <span className="amount">{t.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GamePage;
