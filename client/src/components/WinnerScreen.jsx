import React, { useEffect, useState } from "react";

export default function WinnerScreen({
  winner,
  currentUser,
  room,
  onPlayAgain,
  onExit,
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    // Trigger confetti animation
    triggerConfetti();
  }, []);

  const triggerConfetti = () => {
    if (typeof window !== "undefined" && window.confetti) {
      try {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log("Confetti library not loaded");
      }
    }
  };

  const isWinner = winner?.id === currentUser?.id;
  const matchDuration = room?.gameState?.startedAt
    ? Math.round((Date.now() - room.gameState.startedAt) / 1000)
    : 0;
  const minutes = Math.floor(matchDuration / 60);
  const seconds = matchDuration % 60;

  return (
    <div className="screen winner-overlay">
      <div className={`winner-container ${isWinner ? "is-winner" : ""}`}>
        <div className="winner-content">
          {isWinner ? (
            <>
              <div className="winner-trophy">🏆</div>
              <h1 className="winner-title">You Win!</h1>
              <p className="winner-subtitle">
                Congratulations, {currentUser?.username}!
              </p>
            </>
          ) : (
            <>
              <div className="winner-trophy">👑</div>
              <h1 className="winner-title">{winner?.username} Wins!</h1>
              <p className="winner-subtitle">Better luck next time!</p>
            </>
          )}

          <div className="game-summary-winner">
            <div className="summary-item">
              <span className="summary-label">Winner</span>
              <span className="summary-value">{winner?.username}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Match Duration</span>
              <span className="summary-value">
                {minutes}m {seconds}s
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Players</span>
              <span className="summary-value">{room?.players.length}</span>
            </div>
          </div>

          <div className="winner-actions">
            <button className="button button-primary" onClick={onPlayAgain}>
              Play Again
            </button>
            <button className="button button-secondary" onClick={onExit}>
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
