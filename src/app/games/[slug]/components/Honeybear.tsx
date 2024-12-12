import React, { useState, useEffect, useRef, useMemo } from "react";
import Tile from "../Honeybear/Tile";
import { useBalance } from "@/app/contexts/BalanceContext";
import { gsap } from "gsap";
import Lottie from "lottie-react";
import beeAnimation from "../../../../../public/animations/beeanimation.json";

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
  // for end game visual effects
  const [selectedTiles, setSelectedTiles] = useState<boolean[]>(
    Array(36).fill(false)
  );
  const [displayHowToPlay, setDisplayHowToPlay] = useState<boolean>(false);

  const totalRows = 9;

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

    for (let row = 0; row < totalRows; row++) {
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
    setSelectedTiles(Array(36).fill(false));
    setHasCashedOut(false);
    setGameOver(false);
  }

  // Helper function to check if a row is completed
  function isRowCompleted(rowIndex: number): boolean {
    const tilesPerRow = 4;
    const rowStart = rowIndex * tilesPerRow;
    const rowTileIndices = [0, 1, 2, 3].map((col) => rowStart + col);
    const nonBeeTiles = rowTileIndices.filter(
      (index) => !beeIndexes.includes(index)
    );
    return nonBeeTiles.some((index) => revealedTiles[index]);
  }

  const activeRow = useMemo(() => {
    for (let row = totalRows - 1; row >= 0; row--) {
      if (!isRowCompleted(row)) return row;
    }
    return totalRows;
  }, [revealedTiles, beeIndexes]);

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
  function handleTileClick(index: number, isBee: boolean) {
    if (!gameStarted || gameOver || hasCashedOut || revealedTiles[index])
      return;

    const rowIndex = Math.floor(index / 4);

    if (rowIndex !== activeRow) {
      return;
    }

    // Reveal tile
    setRevealedTiles((prev) => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });

    // if not bee, mark user selected
    if (!isBee) {
      setSelectedTiles((prev) => {
        const newSelected = [...prev];
        newSelected[index] = true;
        return newSelected;
      });
    }

    if (isBee) {
      // Hit a bee - Game Over
      // Reveal all tiles
      setTimeout(() => {
        setRevealedTiles((prev) => {
          const newRevealed = [...prev];
          for (let i = 0; i < newRevealed.length; i++) {
            newRevealed[i] = true;
          }
          return newRevealed;
        });
      }, 1000);
      setGameOver(true);
      setGameStarted(false);
      const beeSound = new Audio("/sounds/bee.wav");
      beeSound.play().catch((error) => {
        console.error("Failed to play bee sound:", error);
      });
    } else {
      const honeySound = new Audio("/sounds/honey.wav");
      honeySound.volume = 0.8;
      honeySound.play().catch((error) => {
        console.error("Failed to play honey sound:", error);
      });
    }
  }

  // Calculate completed rows based on at least one non-bee tile being revealed
  function calculateRowsComplete(
    revealedTiles: boolean[], // eslint-disable-line @typescript-eslint/no-unused-vars
    beeIndexes: number[] // eslint-disable-line @typescript-eslint/no-unused-vars
  ): number {
    let completedRows = 0;

    for (let row = 0; row < totalRows; row++) {
      if (isRowCompleted(row)) {
        completedRows += 1;
      }
    }

    if (completedRows === totalRows) {
      setRevealedTiles((prev) => {
        const newRevealed = [...prev];
        for (let i = 0; i < newRevealed.length; i++) {
          newRevealed[i] = true;
        }
        return newRevealed;
      });

      // End the game
      setGameStarted(false);
      setGameOver(true);

      // Calculate the final multiplier for the fully completed board
      const finalMultiplier = calculateMultiplier(difficulty, totalRows);

      // Automatically cash out using the final multiplier
      if (!hasCashedOut) {
        handleCashout(finalMultiplier);
      }

      return completedRows;
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
      multi = Math.pow(difficulty, rowsComplete) * (1 - houseOdds);
    } else if (difficulty === 3) {
      multi = 0.98 * 4 ** rowsComplete;
    }

    return Number(multi.toFixed(2));
  }

  function handleCashout(forcedMultiplier?: number) {
    if (hasCashedOut) return;
    setHasCashedOut(true);

    // Use the forcedMultiplier if provided, otherwise use the state multiplier
    const currentMultiplier =
      typeof forcedMultiplier === "number" ? forcedMultiplier : multiplier;
    const finalWinnings = bet * currentMultiplier;

    updateBalance(finalWinnings)
      .then(() => {
        setGameOver(true);
        setGameStarted(false);
        setWinnings(finalWinnings);

        // Update multiplier state now that user cashed out with the final multiplier
        setMultiplier(currentMultiplier);
        const coinsSound = new Audio("/sounds/coins.wav");
        coinsSound.volume = 0.5;
        coinsSound.play().catch((error) => {
          console.error("Failed to play coins sound:", error);
        });
      })
      .catch((error) => {
        console.error("Failed to add winnings:", error);
        alert("Failed to cash out. Please try again.");
      });
    setTimeout(() => {
      setRevealedTiles((prev) => {
        const newRevealed = [...prev];
        for (let i = 0; i < newRevealed.length; i++) {
          newRevealed[i] = true;
        }
        return newRevealed;
      });
    }, 700);
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

  function handleHowToPlayClick() {
    setDisplayHowToPlay(true);
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

  // Animate winnings anouncement
  useEffect(() => {
    if (winnings && hasCashedOut && !gameStarted) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        ".winningsAnouncement",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          delay: 0.7,
          ease: "back.out(1.7)",
        }
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

  // Bee animation delays
  const [playSecond, setPlaySecond] = useState(false);
  const [playThird, setPlayThird] = useState(false);
  const [playFourth, setPlayFourth] = useState(false);

  // Animate bees
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= 2000 && !playSecond) {
        setPlaySecond(true);
      }

      if (elapsed >= 5000 && !playThird) {
        setPlayThird(true);
      }

      if (elapsed >= 7000 && !playFourth) {
        setPlayFourth(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [playSecond, playThird, playFourth]);

  // Animate bear winning sequence
  useEffect(() => {
    if (winnings && hasCashedOut && !gameStarted) {
      const timeline = gsap.timeline({ delay: 1 });
      const bearSound = new Audio("/sounds/bear.mp3");
      const dingSound = new Audio("/sounds/ding.mp3");
      bearSound.volume = 0.4;

      // Animate bear in and play bear sound on start
      timeline.fromTo(
        ".bear",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          onStart: () => {
            bearSound.play();
            dingSound.play();
          },
        }
      );

      // Animate honey in with stagger and create a new audio instance for each honey
      timeline.fromTo(
        ".honey",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          delay: 0.3,
          duration: 0.4,
          ease: "back.out(1.7)",
          stagger: {
            each: 0.12,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onStart: (index, target) => {
              const honeySoundInstance = new Audio("/sounds/honeypop.mp3");
              honeySoundInstance.play().catch((error) => {
                console.error("Error playing honey sound:", error);
              });
            },
          },
        },
        "<"
      );

      // Pause before animating them out
      timeline.to({}, { duration: 0.5 });

      // Animate bear out
      timeline.to(".bear", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.in(1.7)",
      });

      // Animate honey out simultaneously
      timeline.to(
        ".honey",
        {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.in(1.7)",
        },
        "<"
      );
    }
  }, [winnings, hasCashedOut, gameStarted]);

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-1/5 bg-slate-600 p-4">
        {/* Bet Amount */}
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
            <select
              className="w-full bg-transparent outline-none text-white"
              disabled={gameStarted}
              value={difficulty}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDifficulty(val);
              }}
            >
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
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
        {/* How to play */}
        <button
          onClick={handleHowToPlayClick}
          className="bg-slate-700 p-2 rounded text-sm absolute left-[13.4%] bottom-[10%] opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          How to play
        </button>
        {/* Cashout Button */}
        {gameStarted && !hasCashedOut && (
          <button
            onClick={() => handleCashout()}
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
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 relative overflow-hidden">
        {/* Bee Animation */}
        <Lottie
          animationData={beeAnimation}
          loop
          autoplay
          className="absolute z-10 hidden xl:block"
        />
        {playSecond && (
          <Lottie
            animationData={beeAnimation}
            loop
            autoplay
            style={{ transform: "scaleX(-1)" }}
            className="absolute z-10 top-10 rotate-12 hidden xl:block"
          />
        )}
        {playThird && (
          <Lottie
            animationData={beeAnimation}
            loop
            autoplay
            className="absolute z-10 top-24 hidden xl:block"
          />
        )}
        {playFourth && (
          <Lottie
            animationData={beeAnimation}
            loop
            autoplay
            className="absolute z-10 top-40 -rotate-45 hidden xl:block"
          />
        )}
        {hasCashedOut && (
          <div>
            <img
              src="/bear.svg"
              alt="bear"
              className="bear absolute z-50 w-72 top-[30%] left-[37%] opacity-0"
            />
            <img
              src="/honey.svg"
              alt="honey"
              className="honey absolute z-50 w-28 top-[28%] left-[36%] opacity-0"
            />
            <img
              src="/honey.svg"
              alt="honey"
              className="honey absolute z-50 w-28 top-[24%] left-[44.5%] opacity-0"
            />
            <img
              src="/honey.svg"
              alt="honey"
              className="honey absolute z-50 w-28 top-[28%] left-[53%] opacity-0"
            />
          </div>
        )}

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
            className="absolute top-0 left-[10%] w-[100%] h-[100%] scale-125 object-cover z-20 rotate-2"
            alt="Honeybear"
          />

          {/* Game Board */}
          <div
            id="board"
            className="absolute top-[22%] left-[34%] w-[32%] h-[70%] bg-amber-600 bg-opacity-20 backdrop-blur-md z-30 rounded border border-amber-950 border-opacity-20 grid grid-cols-4 gap-x-2 p-2"
          >
            {revealedTiles.length === 0
              ? Array.from({ length: 36 }).map((_, index) => (
                  <Tile
                    key={index}
                    isBee={false}
                    gameStarted={gameStarted}
                    onTileClick={() => {}}
                    gameOver={gameOver}
                    revealed={false}
                    isSelectable={false}
                    userSelected={false}
                    didWinGame={hasCashedOut}
                  />
                ))
              : Array.from({ length: totalRows })
                  .reverse()
                  .flatMap((_, row) => {
                    const actualRow = row;
                    const rowStart = actualRow * 4;
                    return [0, 1, 2, 3].map((col) => rowStart + col);
                  })
                  .map((index) => {
                    const isBee = beeIndexes.includes(index);
                    const isRevealed = revealedTiles[index];
                    const rowIndex = Math.floor(index / 4);

                    const isSelectable =
                      rowIndex === activeRow &&
                      gameStarted &&
                      !gameOver &&
                      !hasCashedOut &&
                      !isRevealed;

                    return (
                      <Tile
                        key={index}
                        isBee={isBee}
                        gameStarted={gameStarted}
                        gameOver={gameOver}
                        revealed={isRevealed}
                        onTileClick={
                          isSelectable
                            ? () =>
                                handleTileClick(
                                  index,
                                  beeIndexes.includes(index)
                                )
                            : () => {}
                        }
                        isSelectable={isSelectable}
                        userSelected={selectedTiles[index]}
                        didWinGame={hasCashedOut}
                      />
                    );
                  })}
          </div>
        </div>
        {/* {hasCashedOut && (
          <div className="winningsAnouncement absolute top-[41%] right-[42%] bg-green-600 p-8 rounded font-bold z-50 flex flex-col items-center justify-center">
            <div className="text-2xl flex items-center space-x-1">
              <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
              <p>{(winnings / 100).toFixed(2)}</p>
            </div>
            <p className="text-sm mt-2">{multiplier}X</p>
          </div>
        )} */}
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
                <h3 className="text-lg font-semibold">Game Objective</h3>
                <p className="text-sm leading-relaxed">
                  Start by placing a bet and choosing a difficulty level. Then,
                  reveal tiles row by row. Each tile can either be delicious
                  honey or a hidden bee! Reveal honey tiles to advance and
                  increase your multiplier. Hit a bee and the game ends—-so know
                  when to cash out!
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Difficulty Levels</h3>
                <ul className="text-sm list-disc list-inside leading-relaxed">
                  <li>
                    <span className="font-semibold">Easy:</span> 1 bee per row,
                    safer but lower max multiplier.
                  </li>
                  <li>
                    <span className="font-semibold">Medium:</span> 2 bees per
                    row, balanced difficulty and rewards.
                  </li>
                  <li>
                    <span className="font-semibold">Hard:</span> 3 bees per row,
                    very difficult but offers the highest possible multipliers.
                    Getting to the end on this difficulty grants ~250,000X!
                  </li>
                </ul>
                <p className="text-sm">
                  The harder the difficulty, the more bees you must dodge—but
                  the bigger your potential payout.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Odds & Multipliers</h3>
                <p className="text-sm leading-relaxed">
                  Each successfully cleared row increases your multiplier based
                  on the chosen difficulty. The formula is designed so that:
                </p>
                <ul className="text-sm list-disc list-inside leading-relaxed">
                  <li>Easy: Multipliers grow steadily at a lower rate.</li>
                  <li>
                    Medium: Each cleared row ramps up your multiplier more
                    quickly.
                  </li>
                  <li>
                    Hard: Your multiplier grows fastest, reflecting the highest
                    risk.
                  </li>
                </ul>
                <p className="text-sm">
                  Clearing all rows grants the top payout automatically.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Cash Out Early</h3>
                <p className="text-sm leading-relaxed">
                  You can cash out at any time to lock in your current winnings.
                  But if you hit a bee, you lose everything—so choose wisely.
                </p>
              </section>
            </div>
          </div>
        )}
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
