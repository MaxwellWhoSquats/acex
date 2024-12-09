// Test.tsx

"use client";
import React, { useState, useRef, useEffect } from "react";
import Card from "./Card";
import { useBlackjack } from "./testblackjack";
import { useBalance } from "@/app/contexts/BalanceContext";

interface BoardSize {
  width: number;
  height: number;
}

const Test = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<BoardSize>({
    width: 0,
    height: 0,
  });
  const [bet, setBet] = useState(0);

  const { balance, updateBalance } = useBalance();

  // Animation tracking
  const [initialAnimationComplete, setInitialAnimationComplete] =
    useState(false);
  const [initialDealCardsCount, setInitialDealCardsCount] = useState(0);
  const [hitCardsCount, setHitCardsCount] = useState(0);
  const [standCardsCount, setStandCardsCount] = useState(0);

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
    dealerHasBlackjack,
    gameResult,
    resetGame,
    gameOver,
  } = useBlackjack(bet);

  const [displayedPlayerScore, setDisplayedPlayerScore] = useState<number>(0);
  const [displayedDealerScore, setDisplayedDealerScore] = useState<number>(0);
  const [localGameOver, setLocalGameOver] = useState(false);
  const [canPlayerAct, setCanPlayerAct] = useState(false);

  // Ref to track if balance has been updated for the current game
  const balanceUpdatedRef = useRef(false);

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

  useEffect(() => {
    if (gameResult && !balanceUpdatedRef.current) {
      console.log(
        "Updating balance for gameResult:",
        gameResult,
        "with bet:",
        bet
      );
      // Set the flag immediately to prevent multiple updates
      balanceUpdatedRef.current = true;

      let amountChange = 0;

      if (gameResult === "WIN") {
        amountChange = bet * 2; // Return bet + winnings
      } else if (gameResult === "PUSH") {
        amountChange = bet; // Return bet
      } else if (gameResult === "LOSE") {
        amountChange = 0; // Bet already subtracted
      }

      if (amountChange !== 0) {
        updateBalance(amountChange)
          .then(() => {
            console.log("Balance updated successfully.");
            setLocalGameOver(true); // Ensure localGameOver is set
            // No need to resetGame here
          })
          .catch((error) => {
            console.error("Failed to update balance:", error);
            alert("Failed to update balance. Please contact support.");
            // Optionally, you might want to revert the initial bet if updating balance fails
          });
      } else {
        setLocalGameOver(true); // Ensure localGameOver is set
      }
    }
  }, [gameResult, bet, updateBalance]);

  function handleBetButtonClick() {
    if (bet <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    if (typeof balance !== "number" || balance < bet) {
      alert("Insufficient balance to place this bet.");
      return;
    }

    // Reset the game state before starting a new game
    resetGame();

    setInitialAnimationComplete(false);
    setInitialDealCardsCount(0);
    setHitCardsCount(0);
    setStandCardsCount(0);
    setLocalGameOver(false);
    setCanPlayerAct(false);

    // Reset the balance updated flag for the new game
    balanceUpdatedRef.current = false;

    // Subtract the bet when placing the bet
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
    await hit();
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
      // Subtract the additional bet
      await updateBalance(-bet);
      setBet((prev) => prev * 2);

      // Perform hit and await its completion
      const canContinue = await hit();

      // If the player hasn't busted, proceed to stand
      if (canContinue) {
        await stand();
      }
    } catch (error) {
      console.error("Failed to double down:", error);
      alert("Failed to double down. Please try again.");
    }
  }

  function handleInitialCardAnimationComplete() {
    // Called after each initial card finishes its initial deal animation
    setInitialDealCardsCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 4) {
        // All initial cards done
        setInitialAnimationComplete(true);
        setDisplayedPlayerScore(playerScore);

        if (playerScore === 21 || dealerScore === 21) {
          // Immediate outcome (like initial blackjack)
          setDisplayedDealerScore(dealerScore);
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

  function handleHitCardAnimationComplete() {
    // Called after each hit card finishes its animation
    setHitCardsCount((prev) => {
      const newCount = prev + 1;
      setDisplayedPlayerScore(playerScore);

      // If player hits 21
      if (playerScore === 21 && !localGameOver) {
        setTimeout(() => {
          setCanPlayerAct(false);
          stand();
        }, 1000);
      } else {
        if (playerScore < 21 && !localGameOver) {
          setCanPlayerAct(true);
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
      setLocalGameOver(true);
      // No "Play Again" button, so no need to set any state here
    }
  }, [
    initialAnimationComplete,
    localGameOver,
    standCardsCount,
    dealerHand.length,
    dealerDoneDrawing,
    dealerScore,
  ]);

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
          flipDealerCard={dealerTurn || dealerHasBlackjack}
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
          onAnimationComplete={handleHitCardAnimationComplete}
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

  return (
    <div className="flex flex-1">
      <aside className="w-1/5 bg-slate-600 p-2">
        <h2 className="text-sm mb-1">Bet Amount</h2>
        <section id="bet" className="flex h-8 space-x-2 mb-3">
          <div className="bg-slate-800 w-full flex rounded p-2 items-center">
            <input
              className="w-full bg-transparent outline-none text-white"
              placeholder="0.00"
              disabled={gameStarted}
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
            disabled={gameStarted || bet < 2}
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
          className={`w-full bg-purple-500 p-2 rounded font-bold text-white transition-all duration-200 transform active:scale-95 ${
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
        <div className="mt-4 text-center text-sm text-white">
          Current Balance:{" "}
          {typeof balance === "number" ? `$${balance.toFixed(2)}` : balance}
        </div>
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
              className="absolute bottom-[40%] left-[35%] transform -translate-x-1/2 bg-gray-700 bg-opacity-75 text-white px-2 py-1 rounded text-sm"
              style={{ zIndex: 10 }}
            >
              {displayedPlayerScore}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Test;
