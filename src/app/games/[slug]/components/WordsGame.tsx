import React, { useEffect, useLayoutEffect, useState } from "react";
import { useBalance } from "@/app/contexts/BalanceContext";
import {
  fourLetterWords,
  fiveLetterWords,
  sixLetterWords,
} from "./Words/wordlist";
import { gsap } from "gsap";

const WordsGame = () => {
  const [bet, setBet] = useState<number>(0); // in cents
  const [difficulty, setDifficulty] = useState<number>(5);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winnings, setWinnings] = useState<number | null>(null);
  const [didWin, setDidWin] = useState<boolean>(false);
  const [displayHowToPlay, setDisplayHowToPlay] = useState<boolean>(false);
  const { balance, updateBalance } = useBalance();

  const [word, setWord] = useState<string[]>([]);
  const [userGuess, setUserGuess] = useState<string>("");
  const [displayedWord, setDisplayedWord] = useState<string[]>(
    Array(5).fill("")
  );
  const [letterColors, setLetterColors] = useState<string[]>(
    Array(5).fill("bg-gray-700")
  );
  const [attemptsLeft, setAttemptsLeft] = useState<number>(4);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

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
    console.log("Random word: ", wordList[randomIndex]);
    return wordList[randomIndex].split("");
  }

  // Update the word whenever difficulty changes
  useEffect(() => {
    const newWord = generateRandomWord(difficulty);
    setWord(newWord);
    setDisplayedWord(Array(difficulty).fill(""));
  }, [difficulty]);

  // Fade in the components when a new word is generated
  useLayoutEffect(() => {
    if (word.length > 0 && !gameStarted) {
      gsap.fromTo(
        "#wordDisplayBeforeStart",
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
      gsap.fromTo(
        "#guess",
        {
          y: 20,
          opacity: 0,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.5,
        }
      );
    }
  }, [difficulty]);

  // Animate each letter with a bounce effect
  useLayoutEffect(() => {
    if (word.length > 0 && !gameStarted) {
      word.forEach((_, index) => {
        const letterElement = `#letter-${index}`;
        gsap
          .to(letterElement, {
            y: -20, // Move up
            duration: 0.2, // Quick jump
            ease: "power2.out",
            delay: 0.8 + index * 0.1, // Start a second late with stagger
            onStart: () => {
              const popSound = new Audio("/sounds/pop.wav");
              popSound.play().catch((error) => {
                console.error("Error playing honey sound:", error);
              });
            },
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

  // Check if the player has run out of attempts
  useEffect(() => {
    if (attemptsLeft === 0) {
      setGameOver(true);
      setGameStarted(false);
      setDidWin(false);
    }
  }, [attemptsLeft]);

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

  // Animate winnings anouncement
  useEffect(() => {
    if (winnings && gameOver && didWin) {
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
  }, [winnings, gameOver]);

  // Start the game and initialize other states
  function handleBetButtonClick() {
    if (typeof balance !== "number" || balance < bet) {
      alert("Insufficient balance to place this bet.");
      return;
    }

    updateBalance(-bet)
      .then(() => {
        setMultiplier(
          difficulty === 4 ? 1 : difficulty === 5 ? 3 : difficulty === 6 ? 5 : 1
        );
        setWinnings(0); // Reset winnings
        setGameStarted(true);
        setGameOver(false);
        setAttemptsLeft(4);
        setUserGuess(""); // Reset guess
        setDisplayedWord(Array(difficulty).fill(""));
        setLetterColors(Array(difficulty).fill("bg-gray-700")); // Reset colors

        const newWord = generateRandomWord(difficulty);
        setWord(newWord);

        const betSound = new Audio("/sounds/select.ogg");
        betSound.play().catch((error) => {
          console.error("Failed to play bet sound:", error);
        });
      })
      .catch((error) => {
        console.error("Failed to place bet:", error);
      });
  }

  // Handle guess input changes with a character limit
  function handleGuessInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase().slice(0, difficulty);
    setUserGuess(value);
  }

  function handleGuessSubmit() {
    if (userGuess.length !== difficulty) return;

    setDisableSubmit(true);

    // Copy the word to track matched letters
    const wordCopy = [...word];
    const guess = userGuess.split("");

    // Temporary arrays to hold updates
    const tempDisplayedWord = [...displayedWord];
    const tempLetterColors = [...letterColors];

    // First pass: Check for correct letters in the correct positions
    guess.forEach((letter, index) => {
      if (letter === wordCopy[index]) {
        tempDisplayedWord[index] = letter;
        tempLetterColors[index] = "bg-green-500";
        wordCopy[index] = "";
      }
    });

    // Second pass: Check for correct letters in the wrong positions
    guess.forEach((letter, index) => {
      if (
        tempLetterColors[index] !== "bg-green-500" &&
        wordCopy.includes(letter)
      ) {
        tempDisplayedWord[index] = letter;
        tempLetterColors[index] = "bg-yellow-500"; // Correct letter but wrong position
        wordCopy[wordCopy.indexOf(letter)] = "";
      } else if (tempLetterColors[index] !== "bg-green-500") {
        tempDisplayedWord[index] = letter;
        tempLetterColors[index] = "bg-gray-700"; // Incorrect letter
      }
    });

    // Animation and state updates
    guess.forEach((_, index) => {
      setTimeout(() => {
        setDisplayedWord((prev) => {
          const newDisplayedWord = [...prev];
          newDisplayedWord[index] = tempDisplayedWord[index];
          return newDisplayedWord;
        });

        setLetterColors((prev) => {
          const newLetterColors = [...prev];
          newLetterColors[index] = tempLetterColors[index];
          return newLetterColors;
        });

        const letterElement = document.getElementById(`guessedLetter-${index}`);
        if (letterElement) {
          gsap.fromTo(
            letterElement,
            { scale: 0.8, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              ease: "elastic.out(1, 0.5)",
              onStart: () => {
                const popSound = new Audio("/sounds/honeypop.mp3");
                popSound.play().catch((error) => {
                  console.error("Error playing honey sound:", error);
                });
              },
            }
          );
        }
      }, index * 500);
    });

    const totalAnimationDuration = guess.length * 500;
    setTimeout(() => {
      if (tempDisplayedWord.join("") === word.join("")) {
        setDidWin(true);
        handleWin();
      } else {
        setAttemptsLeft((prev) => prev - 1);
      }

      setDisableSubmit(false);
    }, totalAnimationDuration);
  }

  function handleWin() {
    const calculatedWinnings = bet * multiplier;
    updateBalance(calculatedWinnings)
      .then(() => {
        setWinnings(calculatedWinnings);
        setGameOver(true);
        setGameStarted(false);
        setUserGuess("");
      })
      .catch((error) => {
        console.error("Failed to update balance:", error);
        alert("Failed to update winnings. Please try again.");
      });

    // Play win sound after a delay
    setTimeout(() => {
      const coinsSound = new Audio("/sounds/coins.wav");
      coinsSound.volume = 0.5;
      coinsSound.play().catch((error) => {
        console.error("Failed to play coins sound:", error);
      });
    }, 1000);
  }

  function displayBet(betInCents: number) {
    return betInCents > 0 ? (betInCents / 100).toFixed(0) : "";
  }

  function handleBetInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    const parsedValue = inputValue === "" ? 0 : parseInt(e.target.value, 10);
    const betInCents = parsedValue * 100;
    setBet(betInCents);
  }

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
              disabled={gameStarted}
              value={bet === 0 ? 0 : displayBet(bet)}
              onChange={handleBetInputChange}
            />
            <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
          </div>
          <button
            onClick={() => setBet((prev) => Math.floor(prev / 2))}
            disabled={gameStarted || bet <= 0}
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            1/2
          </button>
          <button
            onClick={() => setBet((prev) => (prev === 0 ? 100 : prev * 2))}
            disabled={gameStarted}
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={gameStarted}
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
        {gameOver && !gameStarted && (
          <button
            onClick={handleBetButtonClick}
            className={`w-full bg-purple-500 p-3 rounded font-bold text-white ${
              gameStarted || bet <= 0
                ? "bg-opacity-50 cursor-not-allowed"
                : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600"
            }`}
            disabled={bet <= 0}
          >
            Play Again
          </button>
        )}
        {/* How to play */}
        <button
          onClick={handleHowToPlayClick}
          className="bg-slate-700 p-2 rounded text-sm absolute left-[13.4%] bottom-[10%] opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          How to play
        </button>
      </aside>
      <main className="grid grid-rows-2 flex-1 relative overflow-hidden mt-32 gap-32">
        {/* Word Display Before Start Section */}
        {!gameStarted && (
          <section
            id="wordDisplayBeforeStart"
            key={difficulty}
            className={`grid ${
              difficulty === 4
                ? "grid-cols-4"
                : difficulty === 5
                ? "grid-cols-5"
                : "grid-cols-6"
            } gap-4 w-[55%] justify-self-center self-center`}
          >
            {word.map((letter, index) => (
              <div
                id={`letter-${index}`} // Unique ID for each letter
                key={`${letter}-${index}`} // Unique key for each letter
                className={`p-2 rounded-2xl text-white text-3xl flex items-center justify-center aspect-square border border-white border-opacity-20 ${
                  displayedWord[index]
                    ? letterColors[index]
                    : "bg-gradient-to-br from-slate-900 to-fuchsia-950"
                }`}
              >
                {!didWin ? (
                  <img src="/logo.png" className="" />
                ) : (
                  displayedWord[index]
                )}
              </div>
            ))}
          </section>
        )}
        {/* Guessed Word Section */}
        {gameStarted && (
          <section
            id="guessedWord"
            key={difficulty}
            className={`grid ${
              difficulty === 4
                ? "grid-cols-4"
                : difficulty === 5
                ? "grid-cols-5"
                : "grid-cols-6"
            } gap-4 w-[55%] justify-self-center self-center`}
          >
            {displayedWord.map((Letter, index) => (
              <div
                id={`guessedLetter-${index}`} // Unique ID for each guessed letter
                key={`guessed${Letter}-${index}`} // Unique key for each letter
                className={`p-2 rounded-2xl text-white text-3xl flex items-center justify-center aspect-square border border-white border-opacity-20 ${letterColors[index]}`}
              >
                {displayedWord[index]}
              </div>
            ))}
          </section>
        )}

        {/* Guess Input Section */}
        <section
          id="guess"
          className="w-[25%] justify-self-center self-start flex flex-col items-center"
        >
          <div
            id="guessInput"
            className={`flex items-center justify-center rounded p-4 py-3 w-full ${
              gameStarted ? "bg-slate-900" : "bg-slate-700"
            }`}
          >
            <input
              className="bg-transparent text-white text-xl outline-none text-center tracking-widest w-full"
              placeholder="Guess:"
              disabled={!gameStarted}
              value={userGuess}
              onChange={handleGuessInputChange}
            />
            <button
              className={`p-2 rounded text-white font-bold ml-4 ${
                userGuess.length === difficulty || disableSubmit
                  ? "bg-purple-500 hover:bg-purple-600"
                  : "bg-purple-500 bg-opacity-50 cursor-not-allowed"
              }`}
              onClick={handleGuessSubmit}
              disabled={
                !gameStarted || userGuess.length !== difficulty || disableSubmit
              }
            >
              Enter
            </button>
          </div>
          <section id="attempts-left" className="">
            <p className="text-white text-center mt-4">
              Attempts Left: {attemptsLeft}
            </p>
          </section>
        </section>
        {/* Display Winnings */}
        {didWin && gameOver && winnings && (
          <div className="winningsAnouncement absolute top-[20%] right-[41%] bg-green-600 p-10 rounded font-bold z-50 flex flex-col items-center justify-center opacity-0">
            <div className="text-3xl flex items-center space-x-1">
              <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
              <p>{(winnings / 100).toFixed(2)}</p>
            </div>
            <p className="text mt-2">{multiplier}X</p>
          </div>
        )}
        {/* How to Play */}
        {displayHowToPlay && (
          <div className="howToPlay z-50 absolute top-[10%] right-[25%] w-[50%] h-[60%] p-6 rounded-lg bg-slate-800 font-sans shadow-lg flex flex-col">
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
                  Place your bet and select a difficulty level to start the
                  game. Your goal is to guess the hidden word within a limited
                  number of attempts. Each correct letter in the correct
                  position will be highlighted in green, while correct letters
                  in the wrong position will be highlighted in yellow. Use your
                  attempts wisely to guess the word!
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Difficulty Levels</h3>
                <ul className="text-sm list-disc list-inside leading-relaxed">
                  <li>
                    <span className="font-semibold">4 Letters:</span> Short and
                    straightforward, perfect for beginners.
                  </li>
                  <li>
                    <span className="font-semibold">5 Letters:</span> A balanced
                    challenge for intermediate players.
                  </li>
                  <li>
                    <span className="font-semibold">6 Letters:</span> The
                    toughest level, requiring sharp deduction skills.
                  </li>
                </ul>
                <p className="text-sm">
                  The difficulty level determines the length of the word and the
                  number of letters you need to guess correctly.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Gameplay Rules</h3>
                <ul className="text-sm list-disc list-inside leading-relaxed">
                  <li>You have 4 attempts to guess the word correctly.</li>
                  <li>
                    Green tiles indicate the letter is correct and in the
                    correct position.
                  </li>
                  <li>
                    Yellow tiles indicate the letter is correct but in the wrong
                    position.
                  </li>
                  <li>Gray tiles indicate the letter is not in the word.</li>
                </ul>
                <p className="text-sm">
                  After each guess, use the color-coded hints to refine your
                  next guess.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Winnings</h3>
                <ul className="text-sm list-disc list-inside leading-relaxed">
                  <li>
                    Guessing 4 letter words grants you 1X your bet amount.
                  </li>
                  <li>
                    Guessing 5 letter words grants you 3X your bet amount.
                  </li>
                  <li>Guessing 6 words grants you 5X your bet amount.</li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WordsGame;
