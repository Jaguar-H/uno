import React from "react";
import PlayerHand from "./PlayerHand";

export default function Player(
  { player, layout = "top", isSelf = false, isActive = false, onPlay },
) {
  const initials = player?.username?.split(" ").map((part) => part[0]).join("")
    .slice(0, 2).toUpperCase();

  return (
    <div
      className={`player-card player-${layout} ${
        isActive ? "active-player" : ""
      }`}
    >
      <div className="player-header">
        <div className="player-avatar">{initials}</div>
        <div className="player-details">
          <div className="player-name">{player.username}</div>
          <div className="player-badge">{player.hand.length} cards</div>
        </div>
      </div>
      <PlayerHand
        hand={player.hand}
        layout={layout}
        isSelf={isSelf}
        onPlay={onPlay}
      />
    </div>
  );
}
