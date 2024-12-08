"use client";
import React, { useState, useRef, useEffect } from "react";
import Card from "./Card";
import { useBlackjack } from "./testblackjack";

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
  const [showGameMessage, setShowGameMessage] = useState(false);
  const [bet, setBet] = useState(0);

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
    winnerMessage,
    dealerDoneDrawing,
    dealerHasBlackjack,
  } = useBlackjack(bet);

  const [displayedPlayerScore, setDisplayedPlayerScore] = useState<number>(0);
  const [displayedDealerScore, setDisplayedDealerScore] = useState<number>(0);
  const [localGameOver, setLocalGameOver] = useState(false);
  const [canPlayerAct, setCanPlayerAct] = useState(false);

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

  // Show game message after localGameOver
  useEffect(() => {
    if (localGameOver) {
      const delay = setTimeout(() => setShowGameMessage(true), 1500);
      return () => clearTimeout(delay);
    } else {
      setShowGameMessage(false);
    }
  }, [localGameOver]);

  function handleBetButtonClick() {
    setInitialAnimationComplete(false);
    setInitialDealCardsCount(0);
    setHitCardsCount(0);
    setStandCardsCount(0);
    setLocalGameOver(false);
    setCanPlayerAct(false);

    dealCards();
  }

  function handleHitButtonClick() {
    if (!initialAnimationComplete || !canPlayerAct || localGameOver) return;
    setCanPlayerAct(false);
    hit();
  }

  function handleStandButtonClick() {
    if (!initialAnimationComplete || !canPlayerAct || localGameOver) return;
    setCanPlayerAct(false);
    stand();
  }

  function handleInitialCardAnimationComplete() {
    // Called after each initial card finishes its initial deal animation
    setInitialDealCardsCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 4) {
        // All initial cards done
        setInitialAnimationComplete(true);
        setDisplayedPlayerScore(playerScore);

        if (winnerMessage && winnerMessage.length > 0) {
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
          if (!winnerMessage) {
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
      if (playerScore === 21 && !winnerMessage && !localGameOver) {
        setTimeout(() => {
          if (!winnerMessage && !localGameOver) {
            setCanPlayerAct(false);
            stand();
          }
        }, 1000);
      } else {
        if (playerScore < 21 && !winnerMessage && !localGameOver) {
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

  // New callback specifically for updating score after the dealer's second card is flipped
  function updateScoreDealerSecondCard() {
    // Called once the dealer's face-down card has finished flipping
    setDisplayedDealerScore(dealerScore);
  }

  // Finalize the game once all dealer cards are done and we have a winnerMessage
  useEffect(() => {
    const dealerDrawnCards = dealerHand.length - 2;
    if (
      initialAnimationComplete &&
      winnerMessage &&
      !localGameOver &&
      standCardsCount === dealerDrawnCards &&
      dealerDoneDrawing
    ) {
      setLocalGameOver(true);
    }
  }, [
    initialAnimationComplete,
    winnerMessage,
    localGameOver,
    standCardsCount,
    dealerHand.length,
    dealerDoneDrawing,
  ]);

  const shouldShowFullDealerScore =
    dealerTurn || (winnerMessage && winnerMessage.length > 0);

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

  function getGameOutcomeMessage() {
    if (!localGameOver) return null;
    return winnerMessage;
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
              type="number"
              value={bet === 0 ? "" : bet}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Parse the input value to a number if it's valid; otherwise, keep it empty
                const parsedValue = inputValue === "" ? 0 : Number(inputValue);
                setBet(parsedValue);
              }}
            />
            <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
          </div>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg">
            1/2
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg">
            2x
          </button>
        </section>
        <section id="blackjack-actions" className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleHitButtonClick}
            disabled={
              !initialAnimationComplete || !canPlayerAct || localGameOver
            }
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 ${
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
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 ${
              initialAnimationComplete && canPlayerAct && !localGameOver
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Stand
          </button>
          <button
            disabled={!initialAnimationComplete}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 ${
              initialAnimationComplete && !localGameOver
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Split
          </button>
          <button
            disabled={!initialAnimationComplete}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 ${
              initialAnimationComplete && !localGameOver
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Double
          </button>
        </section>
        <button
          onClick={handleBetButtonClick}
          disabled={gameStarted}
          className={`w-full bg-purple-500 p-2 rounded font-bold text-white transition-all duration-200 transform active:scale-95 ${
            !gameStarted
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
              className="absolute bottom-[40%] left-[35%] transform -translate-x-1/2 bg-gray-700 bg-opacity-75 text-white px-2 py-1 rounded text-sm"
              style={{ zIndex: 10 }}
            >
              {displayedPlayerScore}
            </div>
          </>
        )}

        {showGameMessage && (
          <div className="absolute top-64 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white p-4 rounded">
            {getGameOutcomeMessage()}
          </div>
        )}
      </main>
    </div>
  );
};

export default Test;
