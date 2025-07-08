import React, { useEffect, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { updateBuyIn, deleteBuyIn, addCashOut } from '../api';

const TransactionHistoryDialog = ({ open, gameId, player, onClose, refreshSummary }) => {

  const [editedBuyIns, setEditedBuyIns] = useState([]);
  const [editedCashOut, setEditedCashOut] = useState('');
  const [confirmEdit, setConfirmEdit] = useState({ open: false, idx: null });
  const [confirmCash, setConfirmCash] = useState(false);

  // Reset local copies whenever dialog opens or player changes
  useEffect(() => {
    if (open && player) {
      setEditedBuyIns(player.buyIns);
      setEditedCashOut(player.cashOut ?? '');
    }
  }, [open, player]);

  // Guard after hooks are declared
  if (!open || !player) return null;

  const { name, buyIns, cashOut } = player;

  const handleBuyInChange = (idx, val) => {
    const copy = [...editedBuyIns];
    copy[idx] = val;
    setEditedBuyIns(copy);
  };

  const saveBuyIn = async (idx) => {
    const val = Number(editedBuyIns[idx]);
    if (val > 0 && val !== buyIns[idx]) {
      await updateBuyIn(gameId, name, idx, val);
      await refreshSummary();
      // Ensure local copy reflects any backend rounding/validation
      setEditedBuyIns((prev) => {
        const cp = [...prev];
        cp[idx] = val;
        return cp;
      });
    }
  };

  const confirmAndSave = (idx) => {
    const val = Number(editedBuyIns[idx]);
    if (val > 0 && val !== buyIns[idx]) {
      setConfirmEdit({ open: true, idx });
    }
  };

  const saveCashOut = async () => {
    const val = Number(editedCashOut);
    if (!isNaN(val) && val >= 0 && val !== cashOut) {
      await addCashOut(gameId, { name, cashOut: val });
      refreshSummary();
    }
  };

  const handleCashOutChange = (e) => {
    setEditedCashOut(e.target.value);
  };


  return (
    <div className="confirm-overlay" style={{ zIndex: 1000 }}>
      <div className="confirm-dialog" style={{ width: '400px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
        >
          ✕
        </button>
        <h3 style={{ marginTop: 0 }}>Transaction History - {name}</h3>

        <h4>Buy-Ins</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {editedBuyIns.map((amt, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
              <span>{idx + 1}.</span>
              <input
                type="number"
                value={amt}
                min="0"
                style={{ width: '6rem' }}
                onChange={(e) => handleBuyInChange(idx, e.target.value)}
              />
              <button
                disabled={Number(amt) <= 0 || Number(amt) === buyIns[idx]}
                onClick={() => confirmAndSave(idx)}
              >
                ✓
              </button>
              <button
                onClick={async () => {
                  await deleteBuyIn(gameId, name, idx);
                  refreshSummary();
                }}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>

        <h4 style={{ marginTop: '1rem' }}>Cash-Out</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="number"
            value={editedCashOut}
            min="0"
            style={{ width: '8rem' }}
            onChange={handleCashOutChange}
          />
          <button
            disabled={editedCashOut === '' || Number(editedCashOut) === cashOut}
            onClick={() => setConfirmCash(true)}
          >
            ✓
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmEdit.open}
        message={`Save changes to buy-in #${confirmEdit.idx != null ? confirmEdit.idx + 1 : ''}?`}
        confirmLabel="Save"
        onCancel={() => setConfirmEdit({ open: false, idx: null })}
        onConfirm={async () => {
          if (confirmEdit.idx != null) {
            await saveBuyIn(confirmEdit.idx);
          }
          setConfirmEdit({ open: false, idx: null });
        }}
      />

      <ConfirmDialog
        open={confirmCash}
        message="Save changes to cash-out?"
        confirmLabel="Save"
        onCancel={() => setConfirmCash(false)}
        onConfirm={async () => {
          await saveCashOut();
          setConfirmCash(false);
        }}
      />
    </div>
  );
};

export default TransactionHistoryDialog;
