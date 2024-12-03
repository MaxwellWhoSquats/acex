// BlackjackGame.tsx
"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useBlackjack } from "./Blackjack/blackjack";

const BlackjackGame = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLImageElement>(null);
  const { dealCards, playerHand } = useBlackjack();
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardFace, setCardFace] = useState("cardback.png");

  // Desired position percentages
  const DESIRED_LEFT_PERCENT = 0.5;
  const DESIRED_TOP_PERCENT = 0.8;

  // Initialize card rotation and handle window resize
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
  }, []); // Empty dependency array ensures this runs once on mount

  const handleBetClick = () => {
    if (isAnimating) return; // Prevent multiple animations

    const newPlayerHand = dealCards();
    const firstCard = newPlayerHand[0];
    const desiredCardImage = `${firstCard}.png`;

    const main = mainRef.current;
    const deck = deckRef.current;
    const card = cardRef.current;

    if (!main || !deck || !card) return;

    setIsAnimating(true); // Start animation

    // Reset cardFace to "cardback.png" before starting the animation
    setCardFace("cardback.png");

    gsap.set(card, { rotateY: 0 });

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

    const timeline = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    timeline
      // Move the card from the deck to the desired position with opacity transition
      .fromTo(
        card,
        { x: 0, y: 0, opacity: 0 },
        {
          x: targetX,
          y: targetY,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        }
      )
      // Rotate to 90 degrees (mid-flip)
      .to(card, {
        rotateY: 90,
        duration: 0.4,
        ease: "power3.out",
      })
      // Change the card face once it's halfway flipped
      .add(() => setCardFace(desiredCardImage))
      // Complete the flip to 0 degrees (front facing)
      .to(card, {
        rotateY: 0,
        duration: 0.2,
        ease: "power3.in",
      });
  };

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
          src="/textures/faces/cardback.png"
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
            transform: "rotateY(0deg)", // Ensure initial rotation
          }}
        >
          <img
            src={`/textures/faces/${cardFace}`}
            className="w-32 transform"
            alt="Animated Card"
          />
        </div>
      </main>
    </div>
  );
};

export default BlackjackGame;
