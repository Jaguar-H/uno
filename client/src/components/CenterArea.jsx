import React from "react";

const buildColorClass = (card) => {
  if (!card || card.color === "black") return "wild";
  return `card-${card.color}`;
};

const topLabel = (card) => {
  if (!card) return "★";
  return card.value || "★";
};

export default function CenterArea({ gameState, onDraw }) {
  const discard = gameState?.discardPile || [];
  const topThree = discard.slice(-3);
  const topCard = discard[discard.length - 1];

  return (
    <div className="center-area">
      <div className="draw-stack" onClick={onDraw} role="button" tabIndex={0}>
        <div className="uno-card back card-back layer-1" />
        <div className="uno-card back card-back layer-2" />
        <div className="uno-card back card-back layer-3" />
      </div>

      <div className="discard-stack">
        {topThree.map((card, index) => (
          <div
            key={card.id || index}
            className={`uno-card ${buildColorClass(card)} discard-card`}
            style={{
              transform: `translate(${index * 10}px, ${-index * 8}px) rotate(${
                index * 4
              }deg)`,
            }}
          >
            {topLabel(card)}
          </div>
        ))}
        <div className={`uno-card ${buildColorClass(topCard)} discard-top`}>
          <div className="card-value">{topLabel(topCard)}</div>
        </div>
      </div>
    </div>
  );
}
