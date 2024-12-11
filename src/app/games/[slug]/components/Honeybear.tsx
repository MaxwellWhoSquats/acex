import React, { useState, useEffect, useRef } from "react";
import Tile from "../Honeybear/Tile";
import { useBalance } from "@/app/contexts/BalanceContext";

const Honeybear = () => {
  const [bet, setBet] = useState<number>(0); // in cents
  const [difficulty, setDifficulty] = useState<number>(1); // 1-3
  const [multiplier, setMultiplier] = useState<number>(1);
  const [beeIndexes, setBeeIndexes] = useState<number[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<boolean[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [winnings, setWinnings] = useState<number>(0);
  const { balance, updateBalance } = useBalance();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Shuffle array using Fisher-Yates Shuffle
  function shuffleArray(array: number[]): number[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Generate bee indexes based on difficulty
  function generateBeeIndexes(): number[] {
    const beesPerRow = difficulty;
    const newBeeIndexes: number[] = [];

    for (let row = 0; row < 9; row++) {
      const rowStart = row * 4;
      const rowTiles = [0, 1, 2, 3].map((col) => rowStart + col);
      const shuffled = shuffleArray(rowTiles);
      const beesInRow = shuffled.slice(0, beesPerRow);
      newBeeIndexes.push(...beesInRow);
    }

    return newBeeIndexes;
  }

  // Generate the game board
  function generateGame() {
    const newBeeIndexes = generateBeeIndexes();
    setBeeIndexes(newBeeIndexes);
    setRevealedTiles(Array(36).fill(false));
    setMultiplier(1);
    setWinnings(0);
    setHasCashedOut(false);
    setGameOver(false);
  }

  // Start the game
  function handleBetButtonClick() {
    if (typeof balance !== "number" || balance < bet) {
      alert("Insufficient balance to place this bet.");
      return;
    }

    // Deduct bet from balance
    updateBalance(-bet)
      .then(() => {
        generateGame();
        setGameStarted(true);
        const betSound = new Audio("/sounds/select.ogg");
        betSound.play().catch((error) => {
          console.error("Failed to play bet sound:", error);
        });
      })
      .catch((error) => {
        console.error("Failed to place bet:", error);
      });
  }

  // Handle tile click
  function handleTileClick(index: number) {
    if (!gameStarted || gameOver || hasCashedOut || revealedTiles[index])
      return;

    setRevealedTiles((prev) => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });

    if (beeIndexes.includes(index)) {
      // Hit a bee - Game Over
      setGameOver(true);
      setGameStarted(false);
    }
  }

  // Calculate completed rows based on at least one non-bee tile being revealed
  function calculateRowsComplete(
    revealedTiles: boolean[],
    beeIndexes: number[]
  ): number {
    const tilesPerRow = 4;
    const totalRows = 9; // Total number of rows is fixed at 9

    let completedRows = 0;

    for (let row = 0; row < totalRows; row++) {
      const rowStart = row * tilesPerRow;
      const rowTileIndices = [0, 1, 2, 3].map((col) => rowStart + col);
      const nonBeeTiles = rowTileIndices.filter(
        (index) => !beeIndexes.includes(index)
      );
      const anyNonBeeRevealed = nonBeeTiles.some(
        (index) => revealedTiles[index]
      );
      if (anyNonBeeRevealed) {
        completedRows += 1;
      }
    }

    return completedRows;
  }

  function calculateMultiplier(
    difficulty: number,
    rowsComplete: number
  ): number {
    const houseOdds = 0.02;
    let multi = 1;

    if (rowsComplete === 0) {
      return 1;
    }

    if (difficulty === 1) {
      multi = 1.31 * Math.pow(4 / 3, rowsComplete - 1);
    } else if (difficulty === 2) {
      multi = 1.47 * Math.pow(3 / 2, rowsComplete - 1);
    } else if (difficulty === 3) {
      multi = Math.pow(difficulty, rowsComplete) * (1 - houseOdds);
    }

    return Number(multi.toFixed(2));
  }

  // Handle cashout
  function handleCashout() {
    if (hasCashedOut) return;

    const currentMultiplier = multiplier;
    const winnings = bet * currentMultiplier;
    updateBalance(winnings)
      .then(() => {
        setHasCashedOut(true);
        setGameOver(true);
        setGameStarted(false);
        setWinnings(winnings);
      })
      .catch((error) => {
        console.error("Failed to add winnings:", error);
        alert("Failed to cash out. Please try again.");
      });

    const coinsSound = new Audio("/sounds/coins.wav");
    coinsSound.play().catch((error) => {
      console.error("Failed to play coins sound:", error);
    });
  }

  // Initialize background audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/forest.wav");
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

  // Update multiplier whenever revealedTiles or beeIndexes change
  useEffect(() => {
    if (gameStarted && !gameOver && !hasCashedOut) {
      const rowsComplete = calculateRowsComplete(revealedTiles, beeIndexes);
      const newMultiplier = calculateMultiplier(difficulty, rowsComplete);
      setMultiplier(newMultiplier);
      console.log(
        `Rows Completed: ${rowsComplete}, New Multiplier: ${newMultiplier}x`
      );
    }
  }, [
    revealedTiles,
    gameStarted,
    gameOver,
    hasCashedOut,
    difficulty,
    beeIndexes,
  ]);

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-1/5 bg-slate-600 p-4">
        {/* Balance Display */}
        <h2 className="text-sm mb-2">Balance</h2>
        <div className="text-white mb-4">
          {(Number(balance) / 100).toFixed(2)} Coins
        </div>

        {/* Bet Amount */}
        <h2 className="text-sm mb-1">Bet Amount</h2>
        <section id="bet" className="flex items-center space-x-2 mb-4">
          <div className="bg-slate-800 flex-1 flex rounded p-2 items-center">
            <input
              className="w-full bg-transparent outline-none text-white"
              placeholder="0"
              type="number"
              min="0"
              step="1"
              value={bet === 0 ? "" : (bet / 100).toFixed(0)}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setBet(isNaN(value) ? 0 : value * 100);
              }}
              disabled={gameStarted}
            />
            <img src="/coin.png" className="w-6 h-6 ml-2" alt="Coin" />
          </div>
          <button
            onClick={() => setBet((prev) => Math.max(Math.floor(prev / 2), 0))}
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={gameStarted || bet <= 0}
          >
            1/2
          </button>
          <button
            onClick={() => setBet((prev) => (prev === 0 ? 100 : prev * 2))}
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={gameStarted}
          >
            2x
          </button>
        </section>

        {/* Difficulty Selector */}
        <h2 className="text-sm mb-1">Difficulty</h2>
        <section
          id="difficulty-selector"
          className="flex items-center space-x-2 mb-6"
        >
          <div
            className={`bg-slate-800 flex-1 flex rounded p-2 items-center
                  ${gameStarted ? "bg-opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              className="w-full bg-transparent outline-none text-white"
              disabled={gameStarted}
              value={difficulty}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= 3) setDifficulty(val);
              }}
              type="number"
              min="1"
              max="3"
            />
          </div>
        </section>

        {/* Bet Button */}
        {!gameOver && (
          <button
            onClick={handleBetButtonClick}
            className={`w-full bg-purple-500 p-3 rounded font-bold text-white
                  ${
                    gameStarted || bet <= 0
                      ? "bg-opacity-50 cursor-not-allowed"
                      : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300"
                  }`}
            disabled={gameStarted || bet <= 0}
          >
            {gameStarted ? "Betting..." : "Bet"}
          </button>
        )}
        {gameOver && (
          <button
            onClick={handleBetButtonClick}
            className={`w-full bg-purple-500 p-3 rounded font-bold text-white
                  ${
                    gameStarted
                      ? "bg-opacity-50 cursor-not-allowed"
                      : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300"
                  }`}
          >
            Bet Again
          </button>
        )}

        {/* Cashout Button */}
        {gameStarted && !hasCashedOut && (
          <button
            onClick={handleCashout}
            className="w-full mt-6 bg-green-500 p-3 rounded font-bold text-white transition-all duration-200 transform active:scale-95 hover:bg-green-600 hover:text-gray-300"
          >
            Cashout
          </button>
        )}

        {/* Display Multiplier */}
        {gameStarted && !gameOver && !hasCashedOut && (
          <div className="mt-4 text-white">
            <h3>Multiplier: {multiplier}x</h3>
          </div>
        )}

        {/* Display Game Over Message */}
        {gameOver && (
          <div className="mt-4 text-red-500">
            <h3>Game Over!</h3>
          </div>
        )}

        {/* Display Cashout Message */}
        {hasCashedOut && (
          <div className="mt-4 text-green-500">
            <h3>Cashed Out at {(winnings / 100).toFixed(2)} Coins!</h3>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 relative overflow-hidden">
        {/* Background Images for Large Screens and Above */}
        <div className="hidden xl:block w-full h-full relative">
          {/* Forest Image */}
          <img
            src="/forest.svg"
            className="w-full h-full object-cover"
            alt="Forest"
          />

          {/* Tree Overlay */}
          <img
            src="/tree.svg"
            className="absolute top-0 left-[10%] w-[100%] h-[100%] scale-125 object-cover z-10 rotate-2"
            alt="Honeybear"
          />

          {/* Game Board */}
          <div
            id="board"
            className="absolute top-[22%] left-[34%] w-[32%] h-[70%] bg-amber-600 bg-opacity-20 backdrop-blur-md z-30 rounded border border-amber-950 border-opacity-40 grid grid-cols-4 gap-x-2 p-2"
          >
            {revealedTiles.length === 0
              ? // If the game hasn't started, show all unrevealed tiles
                Array.from({ length: 36 }).map((_, index) => (
                  <Tile
                    key={index}
                    isBee={false}
                    gameStarted={gameStarted}
                    onTileClick={() => {}}
                    gameOver={gameOver}
                    revealed={false}
                  />
                ))
              : // Game has started, render tiles with revealed state
                Array.from({ length: 36 }).map((_, index) => {
                  const isBee = beeIndexes.includes(index);
                  const isRevealed = revealedTiles[index];

                  return (
                    <Tile
                      key={index}
                      isBee={isBee}
                      gameStarted={gameStarted}
                      gameOver={gameOver}
                      revealed={isRevealed}
                      onTileClick={() => handleTileClick(index)}
                    />
                  );
                })}
          </div>
        </div>

        {/* Fallback Message for Screens Below Large */}
        <div className="xl:hidden w-full h-full bg-slate-900 flex items-center justify-center">
          <p className="text-white text-lg text-center px-4">
            Please view on a larger screen.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Honeybear;
