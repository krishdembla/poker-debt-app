import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import './GamePage.css';
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
import { useToast } from '../context/ToastContext';
import TransactionHistoryDialog from '../components/TransactionHistoryDialog';
import PlayerCard from '../components/PlayerCard/PlayerCard';
import AddPlayerDialog from '../components/AddPlayerDialog/AddPlayerDialog';
import { GameContext } from '../context/GameContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';


const getFormatter = (cur) => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur });



const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGameId } = useContext(GameContext);
  const { ws, joinGame, leaveGame } = useWebSocket();
  const [summary, setSummary] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [title, setTitle] = useState('Game');
  const formatter = getFormatter(currency);
  const [transactions, setTransactions] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  // computed totals
  const totals = useMemo(() => {
    const buyInsTotal = summary.reduce((s, p) => s + p.totalBuyIn, 0);
    const cashOutTotal = summary.reduce((s, p) => s + (p.cashOut || 0), 0);
    return { buyInsTotal, cashOutTotal, profit: buyInsTotal - cashOutTotal };
  }, [summary]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState({ open: false, message: '', action: () => {} });
  const { showToast } = useToast();
  const autoSaveTimeoutRef = useRef(null);
  const [settledAt, setSettledAt] = useState(null);

  useEffect(() => {
    setGameId(id);
    refreshSummary();
    
    // Join WebSocket room for this game
    joinGame(id);
    
    // Set up WebSocket message handler
    if (ws) {
      const handleMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'game_update' && data.data) {
            // Refresh summary when we receive updates
            refreshSummary();
            showToast('Game updated in real-time');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.addEventListener('message', handleMessage);
      
      return () => {
        ws.removeEventListener('message', handleMessage);
        leaveGame();
      };
    }
    // eslint-disable-next-line
  }, [id, ws]);

  const refreshSummary = async () => {
    const res = await fetchSummary(id);
    setSummary(res.data.summary);
    if (res.data.metadata?.currency) {
      setCurrency(res.data.metadata.currency);
    }
    if (res.data.metadata?.title) {
      setTitle(res.data.metadata.title);
    }
    if (res.data.metadata?.settledAt) {
      setSettledAt(res.data.metadata.settledAt);
    } else {
      setSettledAt(null);
    }
    setError('');
  };

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      showToast('Auto-saved', 'success');
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  const handleAddPlayer = async (playerData) => {
    try {
      await addBuyIn(id, { name: playerData.name, buyIn: Number(playerData.amount) });
      refreshSummary();
      triggerAutoSave();
      showToast('Player added successfully');
    } catch (err) {
      console.error('Error adding player:', err);
      const errorMessage = err.errorInfo?.message || err.response?.data?.error || 'Failed to add player';
      setError(errorMessage);
    }
  };

  const [imbalance, setImbalance] = useState(0);

  const handleSettle = async () => {
    try {
      const res = await fetchSettlement(id);
      const txns = res.data.transactions;
      setTransactions(txns);
      setImbalance(res.data.imbalance || 0);
      if (res.data.settledAt) setSettledAt(res.data.settledAt);
      showToast('Settlement calculated');
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        console.error(err);
        setError('Unexpected error settling debts');
      }
    }
  };

  // Keyboard shortcuts - moved after function definitions
  useKeyboardShortcuts({
    onAddPlayer: () => setShowAddDialog(true),
    onSettle: handleSettle,
    onRefresh: refreshSummary,
    onGoHome: () => navigate('/games'),
    enabled: true
  });

  return (
    <div className="container">
      <div className="brand">ChipMate</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.5rem' }}>
        <button onClick={()=>navigate('/games')}>&larr; Back</button>
        <h2 style={{ flex:1, textAlign:'center' }}>{title}</h2>
        <ThemeToggle />
      </div>
      {error && <AlertBanner message={error} onClose={() => setError('')} />}
      

      {/* Add Player Dialog */}
      <AddPlayerDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAddPlayer={handleAddPlayer}
        onError={(errorMessage) => {
          // Only show validation errors in the dialog, not in the main banner
          // The dialog will handle displaying the error
        }}
      />

      <div style={{margin:'1rem 0', padding:'1rem', border:'1px solid var(--border-color,#ccc)', borderRadius:'8px', display:'flex', gap:'2rem', flexWrap:'wrap'}}>
        <div><strong>Total Buy-Ins:</strong> {formatter.format(totals.buyInsTotal)}</div>
        <div><strong>Total Cash-Outs:</strong> {formatter.format(totals.cashOutTotal)}</div>
        <div><strong>House Profit:</strong> {formatter.format(totals.profit)}</div>
      </div>

      <div className="players-header">
        <h3>Players</h3>
        {summary.length === 0 && (
          <button 
            className="add-first-player-btn"
            onClick={() => setShowAddDialog(true)}
          >
            + Add First Player
          </button>
        )}
      </div>
      <div className="player-list-container">
        <div className="player-list">
          {summary.map((player) => (
            <PlayerCard
              key={player.name}
              name={player.name}
              totalBuyIn={player.totalBuyIn}
              cashOut={player.cashOut}
              net={player.net}
              formatter={formatter}
              onEditBuyIn={() => {
                setSelectedPlayer(player);
                setHistoryOpen(true);
              }}
              onEditCashOut={async () => {
                // Create a container for our custom prompt
                const container = document.createElement('div');
                container.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: rgba(0, 0, 0, 0.5);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 1000;
                `;

                // Create the dialog
                const dialog = document.createElement('div');
                dialog.style.cssText = `
                  background: var(--bg-color, #ffffff);
                  padding: 1.5rem;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  width: 90%;
                  max-width: 400px;
                  color: var(--text-primary, #333333);
                `;

                // Create the label
                const label = document.createElement('div');
                label.textContent = `Enter cash-out amount for ${player.name}:`;
                label.style.cssText = 'margin-bottom: 1rem; font-weight: 500;';

                // Create the input
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.step = '0.01';
                input.value = player.cashOut || '';
                input.style.cssText = `
                  width: 100%;
                  padding: 0.75rem;
                  margin-bottom: 1rem;
                  border: 2px solid var(--border-color, #cccccc);
                  border-radius: 6px;
                  background: var(--bg-color, #ffffff);
                  color: var(--text-primary, #333333);
                  font-size: 1rem;
                  box-sizing: border-box;
                  transition: border-color 0.2s;
                `;
                
                // Ensure text is visible in dark mode
                input.style.setProperty('color', 'var(--text-primary, #333333)', 'important');
                input.focus();

                // Create button container
                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 0.75rem;';

                // Create cancel button
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.style.cssText = `
                  padding: 0.5rem 1.25rem;
                  border: 2px solid var(--border-color, #cccccc);
                  border-radius: 6px;
                  background: var(--bg-color, #ffffff);
                  color: var(--text-primary, #333333);
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s;
                `;
                
                // Add hover effect
                cancelButton.onmouseover = () => {
                  cancelButton.style.background = 'var(--border-color, #eeeeee)';
                };
                cancelButton.onmouseout = () => {
                  cancelButton.style.background = 'var(--bg-color, #ffffff)';
                };

                // Create confirm button
                const confirmButton = document.createElement('button');
                confirmButton.textContent = 'Save';
                confirmButton.style.cssText = `
                  padding: 0.5rem 1.5rem;
                  border: none;
                  border-radius: 4px;
                  background: var(--accent, #ff6b3d);
                  color: white;
                  font-weight: 500;
                  cursor: pointer;
                `;

                // Add elements to the dialog
                dialog.appendChild(label);
                dialog.appendChild(input);
                buttonContainer.appendChild(cancelButton);
                buttonContainer.appendChild(confirmButton);
                dialog.appendChild(buttonContainer);
                container.appendChild(dialog);
                document.body.appendChild(container);

                // Handle button clicks
                const cleanup = () => {
                  document.body.removeChild(container);
                };

                const handleConfirm = async () => {
                  const value = input.value.trim();
                  if (value === '') {
                    await addCashOut(id, { name: player.name, cashOut: 0 });
                    refreshSummary();
                    triggerAutoSave();
                    cleanup();
                  } else {
                    const val = Number(value);
                    if (!isNaN(val) && val >= 0) {
                      await addCashOut(id, { name: player.name, cashOut: val });
                      refreshSummary();
                      triggerAutoSave();
                      cleanup();
                    } else {
                      showToast('Please enter a valid number');
                      input.focus();
                    }
                  }
                };

                input.addEventListener('keypress', (e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                });

                confirmButton.addEventListener('click', handleConfirm);
                cancelButton.addEventListener('click', cleanup);
              }}
              onViewHistory={() => {
                setSelectedPlayer(player);
                setHistoryOpen(true);
              }}
              onDelete={() => {
                setConfirm({
                  open: true,
                  message: `Are you sure you want to remove ${player.name}?`,
                  action: async () => {
                    try {
                      await removePlayer(id, player.name);
                      refreshSummary();
                      triggerAutoSave();
                      showToast('Player removed successfully');
                    } catch (err) {
                      setError(err.response?.data?.error || 'Failed to remove player');
                    }
                  }
                });
              }}
            />
          ))}
        </div>
        
        {summary.length > 0 && (
        <button 
          className="add-player-button"
          onClick={() => setShowAddDialog(true)}
        >
          <span style={{ fontSize: '1.2rem' }}>+</span> Add Player
        </button>
      )}
      </div>

      <div className="settle-button-container">
        <button 
          onClick={handleSettle}
          className="settle-button"
        >
          Settle Debts
        </button>
      </div>

      <ConfirmDialog open={confirm.open} message={confirm.message} onCancel={()=>setConfirm({...confirm,open:false})} onConfirm={async ()=>{ await confirm.action(); setConfirm({...confirm,open:false}); }} />

      {transactions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ 
            color: 'var(--text-primary, #333)', 
            marginBottom: '1rem',
            fontSize: '1.25rem',
            fontWeight: '600',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid var(--border-color, #eee)'
          }}>
            Settlement Transactions
          </h3>
          <ul className="tx-list" style={{ 
            listStyle: 'none', 
            padding: 0,
            border: '1px solid var(--border-color, #ddd)',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {transactions.map((t, idx) => (
              <li key={idx} className="tx-item" style={{
                padding: '1rem 1.25rem',
                borderBottom: idx < transactions.length - 1 ? '1px solid var(--border-color, #eee)' : 'none',
                backgroundColor: idx % 2 === 0 ? 'var(--bg-color, #fff)' : 'rgba(0, 0, 0, 0.02)',
                color: 'var(--text-primary, #333)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                lineHeight: '1.5'
              }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary, #333)' }}>{t.from}</span>
                <span style={{ color: 'var(--text-secondary, #666)' }}>pays</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary, #333)' }}>{t.to}</span>
                <span style={{ color: 'var(--text-secondary, #666)' }}>:</span>
                <span className="amount" style={{
                  fontWeight: '700',
                  color: 'var(--accent, #ff6b3d)',
                  marginLeft: 'auto',
                  paddingLeft: '1rem'
                }}>
                  {formatter.format(t.amount)}
                </span>
              </li>
            ))}
          </ul>
          {imbalance > 0.01 && (
            <div style={{
              padding: '1rem',
              marginTop: '1rem',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              borderRadius: '6px',
              borderLeft: '4px solid #ff9800',
              color: 'var(--text-primary, #333)',
              lineHeight: '1.5'
            }}>
              <div><strong>Note:</strong> There is an imbalance of {formatter.format(imbalance)} between total buy-ins and cash-outs.</div>
              <div>This amount could not be settled due to the mismatch in buy-in and cash-out totals.</div>
            </div>
          )}
        </div>
      )}

      <TransactionHistoryDialog open={historyOpen} player={selectedPlayer} gameId={id} onClose={()=>setHistoryOpen(false)} refreshSummary={refreshSummary} />

      {settledAt && (
        <div style={{
          background: 'var(--accent, #ff6b3d)',
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          margin: '1rem 0',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '1.1rem',
          letterSpacing: '0.01em',
          boxShadow: '0 2px 8px rgba(255,107,61,0.08)'
        }}>
          Debts settled on {new Date(settledAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default GamePage;
