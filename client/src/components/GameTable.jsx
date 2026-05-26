import React from "react";
import "../table.css";
import Player from "./Player";
import CenterArea from "./CenterArea";

function rotatePlayers(players, currentUserId) {
  const startIndex = players.findIndex((player) => player.id === currentUserId);
  if (startIndex === -1) return players;
  return players.slice(startIndex).concat(players.slice(0, startIndex));
}

export default function GameTable({
  room,
  username,
  onPlayCard,
  onDrawCard,
  onChooseColor,
  isColorChooser,
  selectingColor,
}) {
  const currentUser = room.players.find((player) =>
    player.username === username
  );
  const players = rotatePlayers(room.players, currentUser?.id);
  const seats = ["bottom", "right", "top", "left"];

  return (
    <div className="game-table">
      <div className="table-ambient" />
      <div className="table-ring" />

      {players.map((player, index) => {
        const seat = seats[index] || "top";
        const isSelf = player.id === currentUser?.id;
        const activeIndex = room.gameState?.currentTurnIndex;
        const isActive = activeIndex === room.players.findIndex((p) =>
          p.id === player.id
        );

        return (
          <div key={player.id} className={`player-slot player-${seat}`}>
            <Player
              player={player}
              layout={seat}
              isSelf={isSelf}
              isActive={isActive}
              onPlay={onPlayCard}
            />
          </div>
        );
      })}

      <div className="center-overlay" />
      <CenterArea gameState={room.gameState} onDraw={onDrawCard} />

      {room.gameState?.pendingAction?.type === "choose-color" && (
        <div className="choose-color-panel">
          <div className="choose-color-header">
            {isColorChooser ? "Choose a color" : "Waiting for other player..."}
          </div>
          {isColorChooser && (
            <div className="color-options">
              {[
                { color: "red", label: "Red" },
                { color: "yellow", label: "Yellow" },
                { color: "green", label: "Green" },
                { color: "blue", label: "Blue" },
              ].map((option) => (
                <button
                  key={option.color}
                  className={`color-btn color-btn-${option.color}`}
                  onClick={() => onChooseColor(option.color)}
                  disabled={selectingColor}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="game-tile game-tile-left">UNO</div>
      <div className="game-tile game-tile-right">
        <span>Turn: {room.gameState?.currentTurnIndex + 1 || 0}</span>
      </div>
    </div>
  );
}
