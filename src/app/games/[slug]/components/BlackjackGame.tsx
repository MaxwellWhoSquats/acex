"use client";

import React, { useState, useRef, useEffect } from "react";
import Card from "./Blackjack/Card";
import { useBlackjack } from "./Blackjack/blackjack";
import { useBalance } from "@/app/contexts/BalanceContext";
import { gsap } from "gsap";

interface BoardSize {
  width: number;
  height: number;
}

const Blackjack = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<BoardSize>({
    width: 0,
    height: 0,
  });

  // Initialize bet in cents
  const [bet, setBet] = useState<number>(0); // Stored in cents

  const { balance, updateBalance } = useBalance();

  // Animation tracking
  const [initialAnimationComplete, setInitialAnimationComplete] =
    useState(false);
  const [initialDealCardsCount, setInitialDealCardsCount] = useState(0);
  const [hitCardsCount, setHitCardsCount] = useState(0);
  const [standCardsCount, setStandCardsCount] = useState(0);
  const [scoreBackground, setScoreBackground] = useState("bg-gray-700");
  const [winnings, setWinnings] = useState<number>(0);

  const {
    dealCards,
    hit,
    stand,
    handValue,
    playerHand,
    dealerHand,
    playerScore,
    dealerScore,
    gameStarted,
    dealerTurn,
    dealerDoneDrawing,
    playerHasBlackjack,
    dealerHasBlackjack,
    gameResult,
    resetGame,
    gameOver,
  } = useBlackjack(bet);

  const [displayedPlayerScore, setDisplayedPlayerScore] = useState<number>(0);
  const [displayedDealerScore, setDisplayedDealerScore] = useState<number>(0);
  const [localGameOver, setLocalGameOver] = useState(false);
  const [canPlayerAct, setCanPlayerAct] = useState(false);

  // New state to control delayed flipping of dealer's second card when dealerHasBlackjack is true
  const [flipDealerBlackjackCard, setFlipDealerBlackjackCard] = useState(false);

  // Ref to track if balance has been updated for the current game
  const balanceUpdatedRef = useRef(false);

  // Ref to track if stand has been scheduled to prevent multiple calls
  const standScheduledRef = useRef(false);

  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const { width, height } = boardRef.current.getBoundingClientRect();
        setBoardSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Synchronize localGameOver with gameOver from useBlackjack
  useEffect(() => {
    if (gameOver && !localGameOver) {
      setLocalGameOver(true);
    }
  }, [gameOver, localGameOver]);

  // Modify the balance updating useEffect to wait for localGameOver
  useEffect(() => {
    if (gameResult && localGameOver && !balanceUpdatedRef.current) {
      console.log(
        "Updating balance for gameResult:",
        gameResult,
        "with bet:",
        bet
      );
      balanceUpdatedRef.current = true;

      let winnings = 0;

      if (gameResult === "WIN" && playerHasBlackjack) {
        winnings = Math.round(bet * 2.5); // Return bet + blackjack bonus in cents
      } else if (gameResult === "WIN") {
        winnings = bet * 2; // Return bet + winnings in cents
      } else if (gameResult === "PUSH") {
        winnings = bet; // Return bet in cents
      } else if (gameResult === "LOSE") {
        winnings = 0; // Bet already subtracted
      }

      if (winnings !== 0) {
        updateBalance(winnings)
          .then(() => {
            console.log("Balance updated successfully.");
          })
          .catch((error) => {
            console.error("Failed to update balance:", error);
            alert("Failed to update balance. Please contact support.");
          });
      }

      setWinnings(winnings);
    }
  }, [gameResult, localGameOver, bet, updateBalance, playerHasBlackjack]);

  // Automatically stand when playerScore reaches 21
  useEffect(() => {
    if (
      playerScore === 21 &&
      canPlayerAct &&
      !localGameOver &&
      !standScheduledRef.current
    ) {
      standScheduledRef.current = true;
      setCanPlayerAct(false);
      setTimeout(() => {
        if (!gameOver) {
          stand();
          standScheduledRef.current = false;
        }
      }, 1000);
    }
  }, [playerScore, canPlayerAct, localGameOver, stand, gameOver]);

  // Synchronize displayedPlayerScore with playerScore
  useEffect(() => {
    setDisplayedPlayerScore(playerScore);

    if (playerScore > 21 && !localGameOver) {
      setLocalGameOver(true);
      setCanPlayerAct(false);
    }
  }, [playerScore, localGameOver, canPlayerAct]);

  async function handleBetButtonClick() {
    if (bet <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    if (typeof balance !== "number" || balance < bet) {
      alert("Insufficient balance to place this bet.");
      return;
    }

    resetGame();

    setInitialAnimationComplete(false);
    setInitialDealCardsCount(0);
    setHitCardsCount(0);
    setStandCardsCount(0);
    setLocalGameOver(false);
    setCanPlayerAct(false);
    setFlipDealerBlackjackCard(false);
    setScoreBackground("bg-gray-700");
    setWinnings(0);

    balanceUpdatedRef.current = false;

    // Subtract the bet when placing the bet (bet is already in cents)
    updateBalance(-bet)
      .then(() => {
        dealCards();
      })
      .catch((error) => {
        console.error("Failed to place bet:", error);
        alert("Failed to place bet. Please try again.");
      });
  }

  async function handleHitButtonClick() {
    if (!initialAnimationComplete || !canPlayerAct || localGameOver) return;
    setCanPlayerAct(false);
    const canContinue = await hit();
    if (canContinue) {
      setCanPlayerAct(true);
    } else {
      setLocalGameOver(true);
    }
  }

  async function handleStandButtonClick() {
    if (!initialAnimationComplete || !canPlayerAct || localGameOver) return;
    setCanPlayerAct(false);
    await stand();
  }

  async function handleDoubleButtonClick() {
    if (
      !initialAnimationComplete ||
      !canPlayerAct ||
      localGameOver ||
      playerHand.length !== 2
    )
      return;

    if (typeof balance !== "number" || balance < bet) {
      alert("Insufficient balance to double down.");
      return;
    }

    try {
      // Subtract the additional bet (same amount as original bet)
      await updateBalance(-bet);
      setBet((prev) => prev * 2); // Double the bet in cents

      const canContinue = await hit();
      if (canContinue && !standScheduledRef.current) {
        standScheduledRef.current = true;
        setCanPlayerAct(false);
        setTimeout(() => {
          if (!gameOver) {
            stand();
            standScheduledRef.current = false;
          }
        }, 1000);
      } else if (!canContinue) {
        setLocalGameOver(true);
      }
    } catch (error) {
      console.error("Failed to double down:", error);
      alert("Failed to double down. Please try again.");
    }
  }

  function handleInitialCardAnimationComplete() {
    setInitialDealCardsCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 4) {
        // All initial cards done
        setInitialAnimationComplete(true);
        setDisplayedPlayerScore(playerScore);

        if (playerScore === 21 || dealerScore === 21) {
          // Immediate outcome (initial blackjack)
          setDisplayedDealerScore(dealerScore);

          // If dealer has blackjack, delay the flip
          if (dealerHasBlackjack) {
            setTimeout(() => {
              setFlipDealerBlackjackCard(true);
            }, 500);
          }

          setLocalGameOver(true);
        } else if (!dealerTurn) {
          // Show partial dealer score (just first card)
          if (dealerHand[0]) {
            setDisplayedDealerScore(handValue([dealerHand[0].name]));
          }
          setCanPlayerAct(true);
        } else {
          // dealerTurn is true after initial deal
          setDisplayedDealerScore(dealerScore);
          if (dealerScore < 17) {
            setCanPlayerAct(true);
          }
        }
      }
      return newCount;
    });
  }

  function handleStandCardAnimationComplete() {
    setStandCardsCount((prev) => {
      const newCount = prev + 1;
      if (!localGameOver) {
        setDisplayedDealerScore(dealerScore);
      }
      return newCount;
    });
  }

  // Callback for updating score after the dealer's second card is flipped
  function updateScoreDealerSecondCard() {
    setDisplayedDealerScore(dealerScore);
  }

  // Finalize the game once all dealer cards are done
  useEffect(() => {
    const dealerDrawnCards = dealerHand.length - 2;
    if (
      initialAnimationComplete &&
      !localGameOver &&
      standCardsCount === dealerDrawnCards &&
      dealerDoneDrawing
    ) {
      if (gameResult === "WIN") {
        setScoreBackground("bg-green-600");
      } else if (gameResult === "LOSE") {
        setScoreBackground("bg-red-600");
      } else if (gameResult === "PUSH") {
        setScoreBackground("bg-yellow-600");
      } else {
        setScoreBackground("bg-gray-700");
      }
      setLocalGameOver(true);
    }
  }, [
    initialAnimationComplete,
    localGameOver,
    standCardsCount,
    dealerHand.length,
    dealerDoneDrawing,
    dealerScore,
    gameResult,
  ]);
  // Separate useEffect for setting scoreBackground to red when PLAYER BUSTS
  useEffect(() => {
    if (playerScore > 21 && localGameOver) {
      setTimeout(() => {
        setScoreBackground("bg-red-600");
      }, 500);
    }
  }, [playerScore, localGameOver]);
  useEffect(() => {
    if (playerHasBlackjack && localGameOver) {
      setTimeout(() => {
        setScoreBackground("bg-green-600");
      }, 500);
    }
  }, [playerHasBlackjack, localGameOver]);
  useEffect(() => {
    if (dealerHasBlackjack && localGameOver) {
      setTimeout(() => {
        setScoreBackground("bg-red-600");
      }, 500);
    }
  }, [dealerHasBlackjack, localGameOver]);

  // Animate winnings anouncement
  useEffect(() => {
    if (gameOver && gameResult === "WIN") {
      const timeline = gsap.timeline();
      timeline.fromTo(
        ".winningsAnouncement",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [gameOver, gameResult]);

  const shouldShowFullDealerScore =
    dealerTurn || (localGameOver && !dealerDoneDrawing);

  function renderInitialCards() {
    const initialCards = [];

    // Player's initial cards
    for (let i = 0; i < 2; i++) {
      if (playerHand[i]) {
        initialCards.push(
          <Card
            key={`player-${playerHand[i].id}`}
            card={playerHand[i]}
            person="player"
            index={i}
            boardSize={boardSize}
            delay={i * 1}
            onAnimationComplete={handleInitialCardAnimationComplete}
          />
        );
      }
    }

    // Dealer's first card (face-up on initial deal)
    if (dealerHand[0]) {
      initialCards.push(
        <Card
          key={`dealer-${dealerHand[0].id}`}
          card={dealerHand[0]}
          person="dealer"
          index={0}
          boardSize={boardSize}
          delay={0.5}
          onAnimationComplete={handleInitialCardAnimationComplete}
        />
      );
    }

    // Dealer's second card (face-down on initial deal)
    if (dealerHand[1]) {
      initialCards.push(
        <Card
          key={`dealer-${dealerHand[1].id}`}
          card={dealerHand[1]}
          person="dealer"
          index={1}
          boardSize={boardSize}
          delay={1.5}
          flipDealerCard={dealerTurn || flipDealerBlackjackCard}
          onAnimationComplete={handleInitialCardAnimationComplete}
          updateScoreDealerSecondCard={updateScoreDealerSecondCard}
        />
      );
    }

    return initialCards;
  }

  function renderHitCards() {
    return playerHand
      .slice(2)
      .map((card, index) => (
        <Card
          key={`player-${card.id}`}
          card={card}
          person="player"
          index={index + 2}
          boardSize={boardSize}
          delay={0.3}
        />
      ));
  }

  function renderStandCards() {
    return dealerHand
      .slice(2)
      .map((card, index) => (
        <Card
          key={`dealer-${card.id}`}
          card={card}
          person="dealer"
          index={index + 2}
          boardSize={boardSize}
          delay={0.3 + index * 0.5}
          onAnimationComplete={handleStandCardAnimationComplete}
        />
      ));
  }

  // Helper function to format bet display in dollars
  const displayBet = (betInCents: number) => {
    return betInCents > 0 ? (betInCents / 100).toFixed(0) : "";
  };

  // Helper function to handle user input and convert dollars to cents
  const handleBetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsedValue = inputValue === "" ? 0 : parseInt(inputValue, 10);
    // Convert dollars to cents
    const betInCents = parsedValue * 100;
    setBet(betInCents);
  };

  return (
    <div className="flex flex-1">
      <aside className="w-1/5 bg-slate-600 p-2">
        <h2 className="text-sm mb-1">Bet Amount</h2>
        <section id="bet" className="flex h-8 space-x-2 mb-3">
          <div className="bg-slate-800 w-full flex rounded p-2 items-center">
            <input
              className="w-full bg-transparent outline-none text-white"
              placeholder="0"
              disabled={gameStarted}
              type="number"
              min="0"
              step="1"
              value={bet === 0 ? "" : displayBet(bet)}
              onChange={handleBetInputChange}
            />
            <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
          </div>
          <button
            onClick={() => setBet((prev) => Math.floor(prev / 2))}
            disabled={gameStarted || bet < 200} // At least $2.00 to halve
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            1/2
          </button>
          <button
            onClick={() => setBet((prev) => prev * 2)}
            disabled={gameStarted || bet === 0}
            className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            2x
          </button>
        </section>

        <section id="blackjack-actions" className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={handleHitButtonClick}
            disabled={
              !initialAnimationComplete || !canPlayerAct || localGameOver
            }
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 overflow-hidden ${
              initialAnimationComplete && canPlayerAct && !localGameOver
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Hit
          </button>
          <button
            onClick={handleStandButtonClick}
            disabled={
              !initialAnimationComplete || !canPlayerAct || localGameOver
            }
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 overflow-hidden ${
              initialAnimationComplete && canPlayerAct && !localGameOver
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Stand
          </button>
          <button
            onClick={handleDoubleButtonClick}
            disabled={
              !initialAnimationComplete ||
              !canPlayerAct ||
              localGameOver ||
              playerHand.length !== 2
            }
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 overflow-hidden ${
              initialAnimationComplete &&
              !localGameOver &&
              canPlayerAct &&
              playerHand.length === 2
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Double
          </button>
        </section>

        <button
          onClick={handleBetButtonClick}
          disabled={
            gameStarted ||
            typeof balance !== "number" ||
            balance < bet ||
            bet <= 0
          }
          className={`w-full bg-purple-500 p-4 rounded font-bold text-white transition-all duration-200 transform active:scale-95 ${
            !gameStarted &&
            typeof balance === "number" &&
            balance >= bet &&
            bet > 0
              ? "hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          Bet
        </button>
      </aside>
      <main ref={boardRef} className="flex-1 bg-slate-800 relative">
        <img
          id="deck"
          src="/textures/faces/cardback.png"
          className="w-24 transform absolute top-0 right-0 z-0"
          alt="Card Back"
        />
        {renderInitialCards()}
        {renderHitCards()}
        {renderStandCards()}

        {initialAnimationComplete && (
          <>
            {/* Dealer Score Display */}
            {!shouldShowFullDealerScore && (
              <div
                className="absolute top-[35%] left-[35%] transform -translate-x-1/2 bg-gray-700 bg-opacity-75 text-white px-2 py-1 rounded text-sm"
                style={{ zIndex: 10 }}
              >
                {displayedDealerScore}
              </div>
            )}
            {shouldShowFullDealerScore && (
              <div
                className="absolute top-[35%] left-[35%] transform -translate-x-1/2 bg-gray-700 bg-opacity-75 text-white px-2 py-1 rounded text-sm"
                style={{ zIndex: 10 }}
              >
                {displayedDealerScore}
              </div>
            )}

            {/* Player Score Display */}
            <div
              className={`absolute bottom-[40%] left-[35%] transform -translate-x-1/2 bg-opacity-75 text-white px-2 py-1 rounded text-sm ${scoreBackground}`}
              style={{ zIndex: 10 }}
            >
              {displayedPlayerScore}
            </div>
            {gameOver && gameResult === "WIN" && (
              <div className="winningsAnouncement right-[42%] top-[41%] absolute  bg-green-600 p-8 rounded font-bold z-50 flex flex-col items-center justify-center">
                <div className="text-2xl flex items-center space-x-1">
                  <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
                  <p>{(winnings / 100).toFixed(2)}</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Blackjack;
