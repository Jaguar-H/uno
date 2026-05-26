import React from "react";
import Card from "./Card";

function cardStyle(index, count, layout) {
  const offset = index - (count - 1) / 2;
  const zIndex = index + 1;
  const baseOffset = 42;

  switch (layout) {
    case "bottom":
      return {
        left: `calc(50% + ${offset * baseOffset}px)`,
        top: "0",
        transform: `translateX(calc(-50% + ${offset * 2}px)) rotate(${
          offset * 3
        }deg)`,
        zIndex,
      };
    case "top":
      return {
        left: `calc(50% + ${offset * 34}px)`,
        top: "0",
        transform: `translateX(calc(-50% + ${offset * 2}px)) rotate(${
          offset * 2.5
        }deg)`,
        zIndex,
      };
    case "left":
      return {
        left: "0",
        top: `calc(50% + ${offset * 28}px)`,
        transform: `translateY(calc(-50% + ${offset * 1.5}px)) rotate(-88deg)`,
        zIndex,
      };
    case "right":
      return {
        right: "0",
        top: `calc(50% + ${offset * 28}px)`,
        transform: `translateY(calc(-50% + ${offset * 1.5}px)) rotate(88deg)`,
        zIndex,
      };
    default:
      return { zIndex };
  }
}

export default function PlayerHand(
  { hand = [], layout = "bottom", isSelf = false, onPlay },
) {
  const count = hand.length;

  return (
    <div className={`cards cards-${layout}`}>
      {hand.map((card, index) => {
        const style = cardStyle(index, count, layout);
        return isSelf
          ? (
            <Card
              key={card.id}
              card={card}
              style={style}
              onClick={onPlay}
            />
          )
          : (
            <button
              key={card.id || index}
              type="button"
              className="uno-card back card-back"
              style={style}
              disabled
            />
          );
      })}
    </div>
  );
}
