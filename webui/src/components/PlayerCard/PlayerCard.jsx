import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({
  name,
  totalBuyIn,
  cashOut,
  net,
  onEditBuyIn,
  onEditCashOut,
  onDelete,
  formatter
}) => {
  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="player-card">
      <div className="player-card-content">
        <div className="player-info">
          <div className="player-name">{name}</div>
          <div className="player-amounts">
            <span className="net-amount" style={{ color: net >= 0 ? '#4caf50' : '#f44336' }}>
              {formatter.format(net)}
            </span>
            <span className="buyin-amount">
              {formatter.format(totalBuyIn)} in • {formatter.format(cashOut || 0)} out
            </span>
          </div>
        </div>
        
        <div className="player-actions">
          <div className="action-item">
            <button 
              className="action-btn cashout-btn"
              onClick={(e) => handleActionClick(e, onEditCashOut)}
              aria-label="Record cash out"
            >
              💵
            </button>
            <span className="action-label">Cash Out</span>
          </div>
          <div className="action-item">
            <button 
              className="action-btn edit-btn" 
              onClick={(e) => handleActionClick(e, onEditBuyIn)}
              aria-label="Edit player"
            >
              ✏️
            </button>
            <span className="action-label">Edit</span>
          </div>
          <div className="action-item">
            <button 
              className="action-btn delete-btn"
              onClick={(e) => handleActionClick(e, onDelete)}
              aria-label="Delete player"
            >
              🗑️
            </button>
            <span className="action-label">Delete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
