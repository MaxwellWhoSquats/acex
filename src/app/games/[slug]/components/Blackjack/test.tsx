"use client";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import Card from "./Card";

interface boardSize {
  width: number;
  height: number;
}

export const Test = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<boardSize>({
    width: 0,
    height: 0,
  });

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

  function handleBetButtonClick() {
    setShouldAnimate(true);
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
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg">
            Hit
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg">
            Stand
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg">
            Split
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg">
            Double
          </button>
        </section>
        <button
          onClick={handleBetButtonClick}
          className="w-full bg-purple-500 p-2 rounded font-bold text-white hover:bg-purple-600 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg"
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
        <Card
          cardName="jack_of_hearts"
          person="player"
          index={0}
          animate={shouldAnimate}
          boardSize={boardSize}
          delay={0}
        />
        <Card
          cardName="8_of_diamonds"
          person="dealer"
          index={0}
          animate={shouldAnimate}
          boardSize={boardSize}
          delay={0.5}
        />
        <Card
          cardName="9_of_diamonds"
          person="player"
          index={1}
          animate={shouldAnimate}
          boardSize={boardSize}
          delay={1}
        />
        <Card
          cardName="2_of_clubs"
          person="dealer"
          index={1}
          animate={shouldAnimate}
          boardSize={boardSize}
          delay={1.5}
        />
      </main>
    </div>
  );
};

export default Test;
