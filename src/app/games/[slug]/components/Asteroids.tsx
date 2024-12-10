import React, { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";
import astronautAnimation from "../../../../../public/animations/astronaut.json";
import starryAnimation from "../../../../../public/animations/starry.json";
import Square from "./Asteroids/Square";
import { useBalance } from "@/app/contexts/BalanceContext";
import { gsap } from "gsap";

const Asteroids = () => {
  const [bet, setBet] = useState<number>(0); // cents
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
  const { balance, updateBalance } = useBalance();
  const [winnings, setWinnings] = useState(0);
  const [hasCashedOut, setHasCashedOut] = useState(false);

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
      asteroidSound.volume = 0.5;
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
    if (typeof balance !== "number" || balance < bet) {
      alert("Insufficient balance to place this bet.");
      return;
    }
    // Deduct bet from balance
    updateBalance(-bet)
      .then(() => {
        console.log("Bet placed successfully.");
      })
      .catch((error) => {
        console.error("Failed to place bet:", error);
      });

    const betSound = new Audio("/sounds/select.ogg");
    betSound.play().catch((error) => {
      console.error("Failed to play bet sound:", error);
    });
    // Generate new game
    const newAsteroidIndexes = generateRandomIndexes(totalSquares, asteroids);
    setGameOver(false);
    setGameStarted(true);
    setAsteroidIndexes(newAsteroidIndexes);
    setRevealedSquares(Array(totalSquares).fill(false));
    setSafeClicks(0);
    setHasCashedOut(false);
    setWinnings(0);
  }

  function handleResetButtonClick() {
    handleBetButtonClick();
  }

  function handleCashout() {
    if (hasCashedOut) return; // Prevent multiple cashouts

    // Calculate winnings
    const winnings = bet * multiplier;
    // Add winnings to balance
    updateBalance(winnings)
      .then(() => {
        console.log("Winnings added to balance successfully.");
      })
      .catch((error) => {
        console.error("Failed to add winnings to balance:", error);
      });

    const cashoutSound = new Audio("/sounds/win.wav");
    cashoutSound.play().catch((error) => {
      console.error("Failed to play cashout sound:", error);
    });
    const coinsSound = new Audio("/sounds/coins.wav");
    coinsSound.play().catch((error) => {
      console.error("Failed to play coins sound:", error);
    });

    setHasCashedOut(true);
    setGameOver(true);
    setGameStarted(false);
    setWinnings(winnings);
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

  const displayBet = (betInCents: number) => {
    return betInCents > 0 ? (betInCents / 100).toFixed(0) : "";
  };

  const handleBetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsedValue = inputValue === "" ? 0 : parseInt(inputValue, 10);
    // Convert dollars to cents
    const betInCents = parsedValue * 100;
    setBet(betInCents);
  };

  useEffect(() => {
    setMultiplier(calculateMultiplier(asteroids, safeClicks));
  }, [safeClicks, asteroids]);

  // Animate winnings anouncement
  useEffect(() => {
    if (winnings && hasCashedOut && !gameStarted) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        ".winningsAnouncement",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [winnings, hasCashedOut, gameStarted]);

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-1/5 bg-slate-600 p-2">
        <h2 className="text-sm mb-1">Bet Amount</h2>
        <section id="bet" className="flex h-8 space-x-2 mb-3">
          <div className="bg-slate-800 w-full flex rounded p-2 items-center">
            <input
              className="w-full bg-transparent outline-none text-white"
              placeholder="0"
              type="number"
              min="0"
              step="1"
              value={bet === 0 ? 0 : displayBet(bet)}
              onChange={handleBetInputChange}
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
            onClick={() => {
              if (bet === 0) {
                setBet(100); // cents
              } else if (typeof balance === "number" && bet * 2 >= balance) {
                setBet(balance);
              } else {
                setBet(bet * 2);
              }
            }}
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
            disabled={
              gameStarted ||
              bet === 0 ||
              typeof balance !== "number" ||
              balance < bet
            }
            className={`w-full bg-purple-500 p-4 rounded font-bold text-white
            ${
              gameStarted ||
              bet === 0 ||
              typeof balance !== "number" ||
              balance < bet
                ? "bg-opacity-50 cursor-not-allowed"
                : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300"
            }`}
          >
            {gameStarted ? "Betting..." : "Bet"}
          </button>
        )}
        {gameOver && (
          <button
            disabled={bet === 0 || typeof balance !== "number" || balance < bet}
            onClick={handleResetButtonClick}
            className={`w-full bg-purple-500 p-4 rounded font-bold text-white
              ${
                gameStarted ||
                bet === 0 ||
                typeof balance !== "number" ||
                balance < bet
                  ? "bg-opacity-50 cursor-not-allowed"
                  : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300"
              }`}
          >
            Bet Again
          </button>
        )}
        {gameStarted && !hasCashedOut && (
          <button
            onClick={handleCashout}
            className="w-full mt-6 bg-green-500 p-2 rounded font-bold text-white transition-all duration-200 transform active:scale-95 hover:bg-green-600 hover:text-gray-300"
          >
            Cashout
          </button>
        )}
        {gameStarted && (
          <div id="multiplier">
            <h2
              className={`text-sm mt-2 mb-1 ${
                hasCashedOut ? "text-green-500" : ""
              }`}
            >{`Multiplier: ${multiplier}`}</h2>
          </div>
        )}
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
        {hasCashedOut && (
          <div className="winningsAnouncement absolute bg-green-600 p-8 rounded font-bold z-50 flex flex-col items-center justify-center">
            <div className="text-2xl flex items-center space-x-1">
              <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
              <p>{(winnings / 100).toFixed(2)}</p>
            </div>
            <p className="text-sm mt-2">{multiplier}X</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Asteroids;
