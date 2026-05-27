import React from "react";

export default function LoserScreen({
  winner,
  currentUser,
  room,
  onPlayAgain,
  onExit,
}) {
  const matchDuration = room?.gameState?.startedAt
    ? Math.round((Date.now() - room.gameState.startedAt) / 1000)
    : 0;
  const minutes = Math.floor(matchDuration / 60);
  const seconds = matchDuration % 60;

  return (
    <div className="screen loser-overlay">
      <div className="loser-container">
        <div className="loser-content">
          <div className="loser-trophy">😢</div>
          <h1 className="loser-title">You Lost</h1>
          <p className="loser-subtitle">{winner?.username} won this round!</p>

          <div className="loser-info">
            <div className="info-block">
              <span className="info-label">Winner</span>
              <span className="info-value">{winner?.username}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Your Hand</span>
              <span className="info-value">
                {currentUser?.hand?.length} cards
              </span>
            </div>
            <div className="info-block">
              <span className="info-label">Match Duration</span>
              <span className="info-value">
                {minutes}m {seconds}s
              </span>
            </div>
          </div>

          <div className="loser-actions">
            <button className="button button-primary" onClick={onPlayAgain}>
              Play Again
            </button>
            <button className="button button-secondary" onClick={onExit}>
              Exit Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
