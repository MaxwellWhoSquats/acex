"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const BlackjackGame = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLImageElement>(null);

  // State to manage animation status
  const [isAnimating, setIsAnimating] = useState(false);

  // Desired position percentages
  const DESIRED_LEFT_PERCENT = 0.5;
  const DESIRED_TOP_PERCENT = 0.8;

  const handleBetClick = () => {
    const main = mainRef.current;
    const deck = deckRef.current;
    const card = cardRef.current;

    if (!main || !deck || !card || isAnimating) return;

    setIsAnimating(true); // Start animation

    // Calculate positions
    const mainRect = main.getBoundingClientRect();
    const deckRect = deck.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    // Desired final position based on percentages
    const desiredLeft =
      mainRect.width * DESIRED_LEFT_PERCENT - cardRect.width / 2;
    const desiredTop =
      mainRect.height * DESIRED_TOP_PERCENT - cardRect.height / 2;

    // Current position of the card relative to <main> (it's over the deck)
    const currentLeft = deckRect.left - mainRect.left;
    const currentTop = deckRect.top - mainRect.top;

    // Calculate relative movement
    const targetX = desiredLeft - currentLeft;
    const targetY = desiredTop - currentTop;

    console.log("handleBetClick - TargetX:", targetX, "TargetY:", targetY);

    // Set card's position to deck's position
    gsap.set(card, { x: 0, y: 0, opacity: 0 });

    // Animate to target position
    gsap.to(card, {
      x: targetX,
      y: targetY,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      onComplete: () => setIsAnimating(false), // End animation
    });
  };

  // Window resizing preparedness functionality
  useLayoutEffect(() => {
    const handleResize = () => {
      const main = mainRef.current;
      const deck = deckRef.current;
      const card = cardRef.current;

      if (!main || !deck || !card) return;

      const mainRect = main.getBoundingClientRect();
      const deckRect = deck.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      // Desired final position based on percentages
      const desiredLeft =
        mainRect.width * DESIRED_LEFT_PERCENT - cardRect.width / 2;
      const desiredTop =
        mainRect.height * DESIRED_TOP_PERCENT - cardRect.height / 2;

      // Current position of the card relative to <main> (it's over the deck)
      const currentLeft = deckRect.left - mainRect.left;
      const currentTop = deckRect.top - mainRect.top;

      // Calculate relative movement
      const targetX = desiredLeft - currentLeft;
      const targetY = desiredTop - currentTop;

      console.log("handleResize - TargetX:", targetX, "TargetY:", targetY);

      gsap.to(card, {
        x: targetX,
        y: targetY,
        duration: 1,
        ease: "power3.out",
      });
    };

    // Debounce function to limit the rate at which a function can fire.
    const debounce = (func: Function, delay: number) => {
      let timer: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
      };
    };

    const debouncedHandleResize = debounce(handleResize, 200);

    window.addEventListener("resize", debouncedHandleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, []);

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
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg">
            1/2
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg">
            2x
          </button>
        </section>
        <section id="blackjack-actions" className="grid grid-cols-2 gap-2 mb-3">
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg">
            Hit
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg">
            Stand
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg">
            Split
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg">
            Double
          </button>
        </section>
        <button
          onClick={handleBetClick}
          disabled={isAnimating}
          className={`w-full bg-purple-500 p-2 rounded font-bold text-white hover:bg-purple-600 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg ${
            isAnimating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isAnimating ? "Betting..." : "Bet"}
        </button>
      </aside>
      <main ref={mainRef} className="flex-1 bg-slate-800 relative">
        <img
          id="deck"
          ref={deckRef}
          src="/cardback.png"
          className="w-32 transform absolute top-0 right-0 z-0"
          alt="Card Back"
        />
        <div
          id="card"
          ref={cardRef}
          className="absolute z-10"
          style={{
            top: 0,
            right: 0,
            opacity: 0,
          }}
        >
          <img
            src="/cardback.png"
            className="w-32 transform"
            alt="Animated Card Back"
          />
        </div>
      </main>
    </div>
  );
};

export default BlackjackGame;
