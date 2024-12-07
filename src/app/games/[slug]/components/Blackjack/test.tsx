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

  const {
    dealCards,
    hit,
    stand,
    playerHand,
    dealerHand,
    gameOver,
    gameStarted,
    dealerTurn,
    winnerMessage,
  } = useBlackjack();

  // Handle resizing of the window
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

  // Delay game message until animation is complete
  useEffect(() => {
    if (gameOver) {
      const delay = setTimeout(() => setShowGameMessage(true), 1500);

      return () => clearTimeout(delay);
    } else {
      setShowGameMessage(false); // Reset
    }
  }, [gameOver]);

  function handleBetButtonClick() {
    dealCards();
  }

  function handleHitButtonClick() {
    hit();
  }

  function handleStandButtonClick() {
    stand();
  }

  function renderInitialCards() {
    const initialCards = [];

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
          />
        );
      }

      if (dealerHand[i] && i !== 1) {
        initialCards.push(
          <Card
            key={`dealer-${dealerHand[i].id}`}
            card={dealerHand[i]}
            person="dealer"
            index={i}
            boardSize={boardSize}
            delay={i * 1 + 0.5}
          />
        );
      }
      if (dealerHand[i] && i === 1) {
        initialCards.push(
          <Card
            key={`dealer-${dealerHand[i].id}`}
            card={dealerHand[i]}
            person="dealer"
            index={i}
            boardSize={boardSize}
            delay={i * 1 + 0.5}
            flipDealerCard={dealerTurn}
          />
        );
      }
    }
    return initialCards;
  }

  function renderHitCards() {
    console.log(playerHand);
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
          delay={0.3}
        />
      ));
  }

  function getGameOutcomeMessage() {
    if (!gameOver) return null;
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
            disabled={!gameStarted}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              gameStarted
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Hit
          </button>
          <button
            onClick={handleStandButtonClick}
            disabled={!gameStarted}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              gameStarted
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Stand
          </button>
          <button
            disabled={!gameStarted}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              gameStarted
                ? "hover:bg-slate-700 hover:text-gray-300 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Split
          </button>
          <button
            disabled={!gameStarted}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              gameStarted
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
          className={`w-full bg-purple-500 p-2 rounded font-bold text-white transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg ${
            gameStarted
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-purple-600 hover:text-gray-300 cursor-pointer"
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

        {showGameMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white p-4 rounded">
            {getGameOutcomeMessage()}
          </div>
        )}
      </main>
    </div>
  );
};

export default Test;
