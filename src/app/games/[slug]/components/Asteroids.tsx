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
  const [displayHowToPlay, setDisplayHowToPlay] = useState(false);
  const [displayAccreditations, setDisplayAccreditations] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Animate how to play
  useEffect(() => {
    if (displayHowToPlay) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        ".howToPlay",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [displayHowToPlay]);

  // Animate accreditations
  useEffect(() => {
    if (displayAccreditations) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        ".accreditations",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [displayAccreditations]);

  // Initialize background audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/asteroidsmusic.mp3");
      audioRef.current.volume = 0.2;
      audioRef.current.loop = true;
    }

    const playAudio = setTimeout(() => {
      audioRef.current
        ?.play()
        .catch((error) => console.error("Error playing audio:", error));
    }, 500);

    return () => {
      clearTimeout(playAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
        <div className="flex space-x-2 absolute left-[13.4%] bottom-[10%]">
          {/* How to play */}
          <button
            onClick={() => setDisplayHowToPlay(true)}
            className="bg-slate-700 p-2 rounded text-sm opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            How to play
          </button>
          {/* Accreditations */}
          <button
            onClick={() => setDisplayAccreditations(true)}
            className="bg-slate-700 p-2 rounded text-sm opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Accreditations
          </button>
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
        <Lottie
          animationData={starryAnimation}
          loop={true}
          className="2xl:hidden absolute z-0 -bottom-4 rotate-12"
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
        {/* Fallback Message for Screens Below Large */}
        <div className="lg:hidden w-full h-full bg-slate-900 flex items-center justify-center z-50 absolute">
          <p className="text-white text-lg text-center px-4">
            Please view on a larger screen.
          </p>
        </div>
        {displayHowToPlay && (
          <div className="howToPlay z-50 absolute top-[21%] right-[22%] w-[50%] h-[60%] p-6 rounded-lg bg-slate-800 font-sans shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-white font-bold">How to Play</h2>
              <button
                onClick={() => setDisplayHowToPlay(false)}
                className="font-bold text-white text-xl bg-slate-600 hover:bg-slate-700 p-1 px-3 rounded transition-all"
              >
                X
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto text-white space-y-6 pr-2">
              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Introduction</h3>
                <p className="text-sm leading-relaxed">
                  In this Asteroids game, hidden among the grid of tiles are a
                  set number of asteroids. Your task is to pick safe squares to
                  increase your multiplier and potential winnings, but hitting
                  an asteroid ends the game. The more squares you safely reveal,
                  the bigger your multiplier— and the risk.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Step-by-Step</h3>
                <ul className="text-sm list-disc list-inside leading-relaxed">
                  <li>
                    <span className="font-semibold">Set Your Bet:</span> Choose
                    your wager and click <strong>Bet</strong> to start the
                    round.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Select Difficulty (Asteroids):
                    </span>
                    Decide how many asteroids (3 to 24) will be hidden. More
                    asteroids mean higher potential payouts, but increased risk.
                  </li>
                  <li>
                    <span className="font-semibold">Reveal Safe Squares:</span>{" "}
                    Click tiles to reveal them. Each safe square boosts your
                    multiplier and potential winnings.
                  </li>
                  <li>
                    <span className="font-semibold">Avoid the Asteroids:</span>{" "}
                    Hitting an asteroid ends the game and you lose your bet.
                  </li>
                  <li>
                    <span className="font-semibold">Cash Out Anytime:</span> You
                    can cash out at any point to lock in your current winnings
                    before risking another pick.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Risk & Reward</h3>
                <p className="text-sm leading-relaxed">
                  Every safe pick you make increases your multiplier. Fewer
                  asteroids make it easier to pick safely, but yield smaller
                  multipliers. Choosing more asteroids raises the stakes and the
                  potential payouts, but one wrong move and it’s over.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Strategy</h3>
                <p className="text-sm leading-relaxed">
                  Deciding when to stop is key. Do you cash out early for a
                  guaranteed profit, or push your luck to reveal more safe
                  squares and chase a higher multiplier? The choice is yours.
                </p>
              </section>
            </div>
          </div>
        )}
        {displayAccreditations && (
          <div className="accreditations z-50 absolute top-[21%] right-[22%] w-[50%] h-[60%] p-6 rounded-lg bg-slate-800 font-sans shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-white font-bold">Accreditations</h2>
              <button
                onClick={() => setDisplayAccreditations(false)}
                className="font-bold text-white text-xl bg-slate-600 hover:bg-slate-700 p-1 px-3 rounded transition-all"
              >
                X
              </button>
            </div>

            {/* Content */}
            <p>
              Music from #Uppbeat (free for Creators!):
              https://uppbeat.io/t/braden-deal/floating-in-empty-space License
              code: IAL8F6UVQZ5MZKKL
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Asteroids;
