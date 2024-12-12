import React, { useEffect, useState } from "react";
import { useBalance } from "@/app/contexts/BalanceContext";
import {
  fourLetterWords,
  fiveLetterWords,
  sixLetterWords,
} from "./Words/wordlist";
import { gsap } from "gsap";

const WordsGame = () => {
  const [bet, setBet] = useState<number>(0); // in cents
  const [difficulty, setDifficulty] = useState<number>(4);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [word, setWord] = useState<string[]>([]);
  const [revealedLetters, setRevealedLetters] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [winnings, setWinnings] = useState<number>(0);
  const { balance, updateBalance } = useBalance();
  const [displayHowToPlay, setDisplayHowToPlay] = useState<boolean>(false);

  // Seed the game with a random word based on difficulty
  function generateRandomWord(difficulty: number): string[] {
    let wordList: string[] = [];
    switch (difficulty) {
      case 4:
        wordList = fourLetterWords;
        break;
      case 5:
        wordList = fiveLetterWords;
        break;
      case 6:
        wordList = sixLetterWords;
        break;
      default:
        wordList = fourLetterWords;
    }

    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex].split("");
  }

  // Update the word whenever difficulty changes
  useEffect(() => {
    const newWord = generateRandomWord(difficulty);
    setWord(newWord);
  }, [difficulty]);

  // Fade in the word display when a new word is generated
  useEffect(() => {
    if (word.length > 0) {
      setRevealedLetters(Array(word.length).fill(false));

      gsap.fromTo(
        "#wordDisplay",
        {
          scale: 0.8,
          opacity: 0.5,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }
  }, [word]);

  // Animate each letter with a bounce effect
  useEffect(() => {
    if (word.length > 0) {
      word.forEach((_, index) => {
        const letterElement = `#letter-${index}`;
        gsap
          .to(letterElement, {
            y: -20, // Move up
            duration: 0.2, // Quick jump
            ease: "power2.out",
            delay: 0.5 + index * 0.1, // Start a second late with stagger
          })
          .then(() => {
            gsap.to(letterElement, {
              y: 0, // Return to original position
              duration: 0.2, // Quick drop
              ease: "bounce.out",
            });
          });
      });
    }
  }, [word]);

  // Start the game and initialize other states
  function handleBetButtonClick() {
    if (typeof balance !== "number" || balance < bet) {
      alert("Insufficient balance to place this bet.");
      return;
    }

    // Deduct bet from balance
    updateBalance(-bet)
      .then(() => {
        setMultiplier(1); // Reset multiplier
        setWinnings(0); // Reset winnings
        setGameStarted(true);
        setGameOver(false); // Reset game over state
        setHasCashedOut(false); // Reset cashout state

        const betSound = new Audio("/sounds/select.ogg");
        betSound.play().catch((error) => {
          console.error("Failed to play bet sound:", error);
        });
      })
      .catch((error) => {
        console.error("Failed to place bet:", error);
      });
  }

  function handleCashout() {
    if (hasCashedOut) return;
    setHasCashedOut(true);
    const winnings = bet * multiplier;

    updateBalance(winnings)
      .then(() => {
        setGameOver(true);
        setGameStarted(false);
        setWinnings(winnings);

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
  }

  const displayBet = (betInCents: number) => {
    return betInCents > 0 ? (betInCents / 100).toFixed(0) : "";
  };

  const handleBetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsedValue = inputValue === "" ? 0 : parseInt(e.target.value, 10);
    const betInCents = parsedValue * 100;
    setBet(betInCents);
  };

  function handleHowToPlayClick() {
    setDisplayHowToPlay(true);
  }

  return (
    <div className="flex flex-1">
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
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg"
          >
            1/2
          </button>
          <button
            onClick={() => setBet((prev) => (prev === 0 ? 100 : prev * 2))}
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg"
          >
            2x
          </button>
        </section>

        {/* Difficulty Selector */}
        <h2 className="text-sm mb-1">Word Length</h2>
        <section
          id="difficulty-selector"
          className="flex items-center space-x-2 mb-6"
        >
          <select
            className="w-full bg-slate-800 p-2 rounded text-white"
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
          >
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </section>

        {/* Bet Button */}
        {!gameOver && (
          <button
            onClick={handleBetButtonClick}
            className={`w-full bg-purple-500 p-3 rounded font-bold text-white ${
              gameStarted || bet <= 0
                ? "bg-opacity-50 cursor-not-allowed"
                : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600"
            }`}
            disabled={gameStarted || bet <= 0}
          >
            {gameStarted ? "Betting..." : "Bet"}
          </button>
        )}

        {/* Cashout Button */}
        {gameStarted && !hasCashedOut && (
          <button
            onClick={handleCashout}
            className="w-full mt-6 bg-green-500 p-3 rounded font-bold text-white transition-all duration-200 transform active:scale-95 hover:bg-green-600"
          >
            Cashout
          </button>
        )}
      </aside>
      <main className="grid grid-rows-2 flex-1 relative overflow-hidden mt-32 gap-32">
        {/* Word Display Section */}
        <section
          id="wordDisplay"
          key={difficulty}
          className={`grid ${
            difficulty === 4
              ? "grid-cols-4"
              : difficulty === 5
              ? "grid-cols-5"
              : "grid-cols-6"
          } gap-4 w-[55%] justify-self-center self-center opacity-0`}
        >
          {word.map((letter, index) => (
            <div
              id={`letter-${index}`} // Unique ID for each letter
              key={`${letter}-${index}`} // Unique key for each letter
              className="bg-gradient-to-br from-slate-900 to-fuchsia-950 p-2 rounded-2xl text-white text-3xl flex items-center justify-center aspect-square border border-white border-opacity-20"
            >
              {revealedLetters[index] ? (
                letter
              ) : (
                <img src="/logo.png" className="" />
              )}
            </div>
          ))}
        </section>
        {/* Guess Input Section */}
        <section
          id="guess"
          className="w-[25%] justify-self-center self-start flex flex-col items-center"
        >
          <div
            id="guessInput"
            className="bg-slate-950 flex items-center justify-center rounded p-4 py-3 w-full"
          >
            <input
              className="bg-transparent text-white text-xl outline-none text-center tracking-widest w-full"
              placeholder="Guess:"
            />
            <button
              className="bg-purple-600 p-2 rounded text-white font-bold ml-4"
              onClick={() => console.log("Guess clicked")}
            >
              Enter
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WordsGame;
