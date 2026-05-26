import React from "react";

export default function Card(
  { card, small = false, onClick, disabled, style },
) {
  const colorClass = card?.color === "black" ? "wild" : `card-${card?.color}`;
  const classes = ["uno-card", colorClass];
  if (small) classes.push("small");

  return (
    <button
      type="button"
      className={classes.join(" ")}
      style={style}
      onClick={() => onClick && onClick(card?.id)}
      disabled={disabled}
    >
      <div className="card-value">{card?.value}</div>
      {card?.color && <div className="card-color">{card.color}</div>}
    </button>
  );
}
