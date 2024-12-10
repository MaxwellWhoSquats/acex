import { gsap } from "gsap";
import { useEffect, useRef } from "react";

interface SquareProps {
  isAsteroid: boolean;
  gameStarted: boolean;
  onSquareClick: () => void;
  gameOver: boolean;
  revealed: boolean;
}

const Square = ({
  isAsteroid,
  gameStarted,
  onSquareClick,
  gameOver,
  revealed,
}: SquareProps) => {
  const gemRef = useRef<HTMLImageElement | null>(null);
  const asteroidRef = useRef<HTMLImageElement | null>(null);

  function handleClick() {
    if (!gameStarted || revealed || gameOver) return;
    onSquareClick();
  }

  // Animation for revealing gem / asteroid
  useEffect(() => {
    if (revealed && !isAsteroid && gemRef.current) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        gemRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3 }
      );
    }
    if (revealed && isAsteroid && asteroidRef.current) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        asteroidRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3 }
      );
    }
  }, [revealed, isAsteroid]);

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-center backdrop-blur-lg border border-white border-opacity-20 rounded-xl transition-colors duration-100 z-40
        ${!revealed ? "hover:bg-opacity-10 cursor-pointer" : ""}
        ${
          revealed
            ? isAsteroid
              ? "bg-gradient-to-br from-orange-950 to-amber-900"
              : "bg-gradient-to-br from-green-900 to-green-400"
            : "bg-transparent"
        }`}
      style={{
        width: "100%",
        aspectRatio: "1",
      }}
    >
      {!isAsteroid && revealed && (
        <img
          ref={gemRef}
          className="gem"
          src="/gem.svg"
          alt="Asteroid"
          style={{
            width: "70%",
            objectFit: "contain",
          }}
        />
      )}
      {isAsteroid && revealed && (
        <img
          ref={asteroidRef}
          className="gem ml-1.5 mb-1"
          src="/asteroid.svg"
          alt="Asteroid"
          style={{
            width: "70%",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
};

export default Square;
