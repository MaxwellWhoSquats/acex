import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import astronautAnimation from "../../../../../public/animations/astronaut.json";
import starryAnimation from "../../../../../public/animations/starry.json";
import Square from "./Asteroids/Square";

const Asteroids = () => {
  const [bet, setBet] = useState(0);
  const [asteroids, setAsteroids] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [asteroidIndexes, setAsteroidIndexes] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [safeClicks, setSafeClicks] = useState<number>(0);
  const [revealedSquares, setRevealedSquares] = useState<boolean[]>(
    Array(25).fill(false)
  );
  const totalSquares = 25;

  function generateRandomIndexes(total: number, count: number): number[] {
    const indexes = Array.from({ length: total }, (_, i) => i);
    for (let i = indexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }
    return indexes.slice(0, count);
  }

  function handleAsteroidsInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    const parsedValue = inputValue === "" ? 3 : Number(inputValue);
    if (parsedValue >= 3 && parsedValue <= 24) {
      setAsteroids(parsedValue);
    } else {
      setAsteroids(3);
    }
  }

  function handleSquareClick(index: number, isAsteroid: boolean) {
    setRevealedSquares((prev) => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });

    if (isAsteroid) {
      const asteroidSound = new Audio("/sounds/asteroid.wav");
      asteroidSound.volume = 0.7;
      setTimeout(() => {
        asteroidSound.play();
      }, 300);
      setGameOver(true);
      setGameStarted(false);
    } else {
      const rubySound = new Audio("/sounds/ruby.wav");
      rubySound.play();
      setSafeClicks((prev) => prev + 1);
      if (safeClicks + 1 === totalSquares - asteroids) {
        setGameOver(true); // Win condition
        setGameStarted(false);
      }
    }
  }

  function handleBetButtonClick() {
    const newAsteroidIndexes = generateRandomIndexes(totalSquares, asteroids);
    setGameOver(false);
    setGameStarted(true);
    setAsteroidIndexes(newAsteroidIndexes);
    setRevealedSquares(Array(totalSquares).fill(false));
    setSafeClicks(0);
  }

  function handleResetButtonClick() {
    handleBetButtonClick();
  }

  function calculateMultiplier(asteroids: number, safeClicks: number): number {
    const houseOdds = 0.01;
    const totalSquares = 25;

    if (safeClicks === 0) {
      return 1;
    }

    function nCr(n: number, r: number): number {
      function f(num: number): number {
        if (num === 0) {
          return 1;
        }
        return num * f(num - 1);
      }
      return f(n) / (f(r) * f(n - r));
    }

    const safeSquareProbability =
      nCr(totalSquares - asteroids, safeClicks) / nCr(totalSquares, safeClicks);

    const multi = (1 - houseOdds) / safeSquareProbability;

    return Math.round(multi * 100) / 100;
  }

  useEffect(() => {
    setMultiplier(calculateMultiplier(asteroids, safeClicks));
  }, [safeClicks]);

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-1/5 bg-slate-600 p-2">
        <h2 className="text-sm mb-1">Bet Amount</h2>
        <section id="bet" className="flex h-8 space-x-2 mb-8">
          <div className="bg-slate-800 w-full flex rounded p-2 items-center">
            <input
              className="w-full bg-transparent outline-none text-white"
              placeholder="0.00"
              type="number"
              value={bet === 0 ? "" : bet}
              onChange={(e) => {
                const inputValue = e.target.value;
                const parsedValue = inputValue === "" ? 0 : Number(inputValue);
                setBet(parsedValue);
              }}
            />
            <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
          </div>
          <button
            onClick={() => setBet((prev) => Math.floor(prev / 2))}
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            1/2
          </button>
          <button
            onClick={() => setBet((prev) => prev * 2)}
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            2x
          </button>
        </section>
        <h2 className="text-sm mb-1">Asteroids</h2>
        <section id="asteroids-selector" className="flex h-8 mb-6">
          <div
            className={`bg-slate-800 w-full flex rounded p-2 items-center
            ${gameStarted ? "bg-opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              className="w-full bg-transparent outline-none text-white"
              disabled={gameStarted}
              defaultValue={3}
              type="number"
              min="3"
              max="24"
              onChange={handleAsteroidsInputChange}
            />
          </div>
        </section>
        {!gameOver && (
          <button
            onClick={handleBetButtonClick}
            disabled={gameStarted}
            className={`w-full bg-purple-500 p-4 rounded font-bold text-white
            ${
              gameStarted
                ? "bg-opacity-50 cursor-not-allowed"
                : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300"
            }`}
          >
            {gameStarted ? "Betting..." : "Bet"}
          </button>
        )}
        {gameOver && (
          <button
            onClick={handleResetButtonClick}
            className="w-full bg-purple-500 p-4 rounded font-bold text-white transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300"
          >
            Bet Again
          </button>
        )}
        <div id="multiplier">
          <h2 className="text-sm mt-6 mb-1">{`Multiplier: ${multiplier}`}</h2>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 bg-gradient-to-bl from-slate-950 to-fuchsia-950 relative justify-center items-center overflow-hidden">
        {/* Lottie Background */}
        <Lottie
          animationData={astronautAnimation}
          loop={true}
          className="absolute -right-14 -top-16 z-0 w-[40%] rotate-12"
        />
        <Lottie
          animationData={starryAnimation}
          loop={true}
          className="absolute z-0 -top-20"
        />
        <Lottie
          animationData={starryAnimation}
          loop={true}
          className="absolute z-0 -bottom-72 rotate-12"
        />

        {/* Game Board */}
        <div
          id="board"
          className="grid grid-cols-5 gap-3 z-10"
          style={{
            width: "60vmin",
            height: "60vmin",
          }}
        >
          {Array.from({ length: totalSquares }).map((_, index) => (
            <Square
              key={index}
              isAsteroid={asteroidIndexes.includes(index)}
              gameStarted={gameStarted}
              onSquareClick={() =>
                handleSquareClick(index, asteroidIndexes.includes(index))
              }
              gameOver={gameOver}
              revealed={revealedSquares[index]} // visibility
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Asteroids;
