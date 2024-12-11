import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface TileProps {
  isBee: boolean;
  gameStarted: boolean;
  onTileClick: () => void;
  gameOver: boolean;
  revealed: boolean;
  isSelectable: boolean; // New prop added
}

const Tile: React.FC<TileProps> = ({
  isBee,
  gameStarted,
  onTileClick,
  gameOver,
  revealed,
  isSelectable, // Destructure the new prop
}) => {
  const honeyRef = useRef<HTMLImageElement | null>(null);
  const beeRef = useRef<HTMLImageElement | null>(null);

  function handleClick() {
    if (!isSelectable || !gameStarted || revealed || gameOver) return;
    onTileClick();
  }

  // Animation for revealing honey / bee
  useEffect(() => {
    if (revealed && !isBee && honeyRef.current) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        honeyRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
    if (revealed && isBee && beeRef.current) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        beeRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [revealed, isBee]);

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-center rounded transition-all duration-200 transform mt-1.5
        ${
          isSelectable && gameStarted && !revealed && !gameOver
            ? "cursor-pointer hover:scale-105"
            : "cursor-not-allowed"
        }
        ${
          revealed ? (isBee ? "bg-red-500" : "bg-yellow-500") : "bg-amber-950"
        }`}
      style={{
        width: "100%",
        aspectRatio: "1.8",
      }}
    >
      {!isBee && revealed && (
        <img
          ref={honeyRef}
          className="mb-1 mr-0.5"
          src="/honey.svg"
          alt="Honey"
          style={{
            width: "50%",
            objectFit: "contain",
          }}
        />
      )}
      {isBee && revealed && (
        <img
          ref={beeRef}
          src="/bee.svg"
          alt="Bee"
          style={{
            width: "50%",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
};

export default Tile;
