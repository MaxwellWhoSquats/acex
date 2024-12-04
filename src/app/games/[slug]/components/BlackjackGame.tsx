// BlackjackGame.tsx
"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useBlackjack } from "./Blackjack/blackjack";

const BlackjackGame = () => {
  // Refs for each card
  const playerCard1Ref = useRef<HTMLDivElement>(null);
  const dealerCard1Ref = useRef<HTMLDivElement>(null);
  const playerCard2Ref = useRef<HTMLDivElement>(null);
  const dealerCard2Ref = useRef<HTMLDivElement>(null);
  const playerScoreDisplayRef = useRef<HTMLDivElement>(null);
  const dealerScoreDisplayRef = useRef<HTMLDivElement>(null);
  // State variables to manage each card's face
  const [playerCard1Face, setPlayerCard1Face] = useState("cardback.png");
  const [dealerCard1Face, setDealerCard1Face] = useState("cardback.png");
  const [playerCard2Face, setPlayerCard2Face] = useState("cardback.png");
  const [dealerCard2Face, setDealerCard2Face] = useState("cardback.png");

  // Initialize score variables
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [dealerFaceUpValue, setDealerFaceUpValue] = useState(0);
  const [showDealerScore, setShowDealerScore] = useState(false);
  const [bet, setBet] = useState(0);

  const mainRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLImageElement>(null);

  const { dealCards } = useBlackjack(bet);
  const [isAnimating, setIsAnimating] = useState(false);

  // Desired position percentages
  const DESIRED_LEFT_PERCENT = 0.5;

  // Top position percentages for player and dealer
  const PLAYER_DESIRED_TOP_PERCENT = 0.8;
  const DEALER_DESIRED_TOP_PERCENT = 0.2;

  // Offsets for the second cards to prevent full overlap
  const PLAYER_CARD2_OFFSET_X = 40;
  const DEALER_CARD2_OFFSET_X = 40;
  const PLAYER_CARD2_OFFSET_Y = 25;
  const DEALER_CARD2_OFFSET_Y = 25;

  // Handle window resize (in progress)
  useLayoutEffect(() => {
    const handleResize = () => {
      // You can implement responsive positioning here if required
    };

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

  const handleBetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const betValue = parseFloat(e.target.value);
    if (!isNaN(betValue)) {
      setBet(betValue);
    }
  };

  const handleBetClick = () => {
    if (isAnimating) return; // Prevent multiple animations

    // Deal new cards and retrieve both hands
    const {
      playerHand: newPlayerHand,
      dealerHand: newDealerHand,
      playerScore,
      dealerScore,
      dealerFaceUpCard,
    } = dealCards();

    // Ensure that both hands have at least two cards
    if (newPlayerHand.length < 2 || newDealerHand.length < 2) {
      console.error("Not enough cards dealt");
      return;
    }

    // Update scores
    setPlayerScore(playerScore);
    setDealerScore(dealerScore);

    // Extract individual cards
    const playerCard1 = newPlayerHand[0];
    const dealerCard1 = newDealerHand[0];
    const playerCard2 = newPlayerHand[1];
    const dealerCard2 = newDealerHand[1];
    setDealerFaceUpValue(dealerFaceUpCard);

    setIsAnimating(true); // Start animation

    // Reset all card faces to "cardback.png" before starting the animation
    setPlayerCard1Face("cardback.png");
    setDealerCard1Face("cardback.png");
    setPlayerCard2Face("cardback.png");
    setDealerCard2Face("cardback.png");

    // Reset rotations to 0 degrees to ensure consistent flipping
    if (playerCard1Ref.current)
      gsap.set(playerCard1Ref.current, { rotateY: 0 });
    if (dealerCard1Ref.current)
      gsap.set(dealerCard1Ref.current, { rotateY: 0 });
    if (playerCard2Ref.current)
      gsap.set(playerCard2Ref.current, { rotateY: 0 });
    if (dealerCard2Ref.current)
      gsap.set(dealerCard2Ref.current, { rotateY: 0 });

    // Calculate positions relative to the main container
    const main = mainRef.current;
    const deck = deckRef.current;

    if (!main || !deck) {
      console.error("Missing refs");
      return;
    }

    const mainRect = main.getBoundingClientRect();
    const deckRect = deck.getBoundingClientRect();
    const cardWidth = 128; // Assuming w-32 is 128px
    const cardHeight = 192; // Assuming h-48 is 192px

    // Calculate target positions for player and dealer
    const playerLeft = mainRect.width * DESIRED_LEFT_PERCENT - cardWidth / 2;
    const playerTop =
      mainRect.height * PLAYER_DESIRED_TOP_PERCENT - cardHeight / 2;

    const dealerLeft = mainRect.width * DESIRED_LEFT_PERCENT - cardWidth / 2;
    const dealerTop =
      mainRect.height * DEALER_DESIRED_TOP_PERCENT - cardHeight / 2;

    // Calculate relative positions from the deck
    const targetPositions = {
      playerCard1: {
        x: playerLeft - (deckRect.left - mainRect.left),
        y: playerTop - (deckRect.top - mainRect.top),
      },
      dealerCard1: {
        x: dealerLeft - (deckRect.left - mainRect.left),
        y: dealerTop - (deckRect.top - mainRect.top),
      },
      playerCard2: {
        x: playerLeft + PLAYER_CARD2_OFFSET_X - (deckRect.left - mainRect.left),
        y: playerTop + PLAYER_CARD2_OFFSET_Y - (deckRect.top - mainRect.top),
      },
      dealerCard2: {
        x: dealerLeft + DEALER_CARD2_OFFSET_X - (deckRect.left - mainRect.left),
        y: dealerTop + DEALER_CARD2_OFFSET_Y - (deckRect.top - mainRect.top),
      },
    };

    const timeline = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    // 1. Animate Player Card 1
    timeline
      .fromTo(
        playerCard1Ref.current,
        {
          x: 0,
          y: 0,
          opacity: 0,
        },
        {
          x: targetPositions.playerCard1.x,
          y: targetPositions.playerCard1.y,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        }
      )
      .to(playerCard1Ref.current, {
        rotateY: 90,
        duration: 0.2,
        ease: "power3.out",
      })
      .add(() => setPlayerCard1Face(`${playerCard1}.png`))
      .to(playerCard1Ref.current, {
        rotateY: 0,
        duration: 0.2,
        ease: "power3.in",
      });

    // 2. Animate Dealer Card 1
    timeline.fromTo(
      dealerCard1Ref.current,
      {
        x: 0,
        y: 0,
        opacity: 0,
      },
      {
        x: targetPositions.dealerCard1.x,
        y: targetPositions.dealerCard1.y,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
      },
      "-=0.4" // Overlap with the previous animation by 0.4 seconds
    );

    // 3. Animate Player Card 2
    timeline
      .fromTo(
        playerCard2Ref.current,
        {
          x: 0,
          y: 0,
          opacity: 0,
        },
        {
          x: targetPositions.playerCard2.x,
          y: targetPositions.playerCard2.y,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        }
      )
      .to(playerCard2Ref.current, {
        rotateY: 90,
        duration: 0.2,
        ease: "power3.out",
      })
      .add(() => setPlayerCard2Face(`${playerCard2}.png`))
      .to(playerCard2Ref.current, {
        rotateY: 0,
        duration: 0.2,
        ease: "power3.in",
      });

    // 4. Animate Dealer Card 2
    timeline
      .fromTo(
        dealerCard2Ref.current,
        {
          x: 0,
          y: 0,
          opacity: 0,
        },
        {
          x: targetPositions.dealerCard2.x,
          y: targetPositions.dealerCard2.y,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.4" // Overlap with the previous animation by 0.6 seconds
      )
      .to(dealerCard2Ref.current, {
        rotateY: 90,
        duration: 0.2,
        ease: "power3.out",
      })
      .add(() => setDealerCard2Face(`${dealerCard2}.png`))
      .to(dealerCard2Ref.current, {
        rotateY: 0,
        duration: 0.2,
        ease: "power3.in",
      });

    // 5. Show scores
    timeline.fromTo(
      dealerScoreDisplayRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.3,
      }
    );
    timeline.fromTo(
      playerScoreDisplayRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.3,
      },
      "-=0.3"
    );
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
              onChange={handleBetInputChange}
            />
            <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
          </div>
          <button
            disabled={isAnimating}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              isAnimating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            1/2
          </button>
          <button
            disabled={isAnimating}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              isAnimating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            2x
          </button>
        </section>
        <section id="blackjack-actions" className="grid grid-cols-2 gap-2 mb-3">
          <button
            disabled={isAnimating}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              isAnimating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Hit
          </button>
          <button
            disabled={isAnimating}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              isAnimating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Stand
          </button>
          <button
            disabled={isAnimating}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              isAnimating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Split
          </button>
          <button
            disabled={isAnimating}
            className={`bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg ${
              isAnimating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Double
          </button>
        </section>
        <button
          onClick={handleBetClick}
          disabled={isAnimating}
          className={`w-full bg-purple-500 p-2 rounded font-bold text-white hover:bg-purple-600 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg ${
            isAnimating ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isAnimating ? (
            <>
              Betting:{" "}
              <img
                src="/coin.png"
                alt="Coin"
                className="inline w-5 h-5 mb-0.5"
              />
              {bet}
            </>
          ) : (
            "Bet"
          )}
        </button>
      </aside>
      <main ref={mainRef} className="flex-1 bg-slate-800 relative">
        {/* Deck */}
        <img
          id="deck"
          ref={deckRef}
          src="/textures/faces/cardback.png"
          className="w-32 transform absolute top-0 right-0 z-0"
          alt="Card Back"
        />
        {/* Dealer Score */}
        <div
          id="dealer-score"
          ref={dealerScoreDisplayRef}
          className="absolute text-white font-bold text-lg"
          style={{
            top: `${
              mainRef.current
                ? mainRef.current.getBoundingClientRect().height *
                    DEALER_DESIRED_TOP_PERCENT -
                  120
                : 0
            }px`,
            left: "20px",
            opacity: 0,
          }}
        >
          Dealer Score: {dealerFaceUpValue}
        </div>
        {/* Player Score */}
        <div
          id="player-score"
          ref={playerScoreDisplayRef}
          className="absolute text-white font-bold text-lg"
          style={{
            bottom: `${
              mainRef.current
                ? mainRef.current.getBoundingClientRect().height *
                    PLAYER_DESIRED_TOP_PERCENT -
                  350
                : 0
            }px`,
            left: "20px",
            opacity: 0,
          }}
        >
          Player Score: {playerScore === 21 ? "Blackjack!" : playerScore}
        </div>

        {/* Player Card 1 */}
        <div
          id="player-card-1"
          ref={playerCard1Ref}
          className="absolute z-10"
          style={{
            top: 0,
            right: 0,
            opacity: 0,
            transform: "rotateY(0deg)",
          }}
        >
          <img
            src={
              playerCard1Face === "cardback.png"
                ? "/textures/faces/cardback.png"
                : `/textures/faces/${playerCard1Face}`
            }
            className="w-32 transform"
            alt="Player Card 1"
          />
        </div>

        {/* Dealer Card 1 */}
        <div
          id="dealer-card-1"
          ref={dealerCard1Ref}
          className="absolute z-10"
          style={{
            top: 0,
            right: 0,
            opacity: 0,
            transform: "rotateY(0deg)",
          }}
        >
          <img
            src={
              dealerCard1Face === "cardback.png"
                ? "/textures/faces/cardback.png"
                : `/textures/faces/${dealerCard1Face}`
            }
            className="w-32 transform"
            alt="Dealer Card 1"
          />
        </div>

        {/* Player Card 2 */}
        <div
          id="player-card-2"
          ref={playerCard2Ref}
          className="absolute z-10"
          style={{
            top: 0,
            right: 0,
            opacity: 0,
            transform: "rotateY(0deg)",
          }}
        >
          <img
            src={
              playerCard2Face === "cardback.png"
                ? "/textures/faces/cardback.png"
                : `/textures/faces/${playerCard2Face}`
            }
            className="w-32 transform"
            alt="Player Card 2"
          />
        </div>

        {/* Dealer Card 2 */}
        <div
          id="dealer-card-2"
          ref={dealerCard2Ref}
          className="absolute z-10"
          style={{
            top: 0,
            right: 0,
            opacity: 0,
            transform: "rotateY(0deg)",
          }}
        >
          <img
            src={
              dealerCard2Face === "cardback.png"
                ? "/textures/faces/cardback.png"
                : `/textures/faces/${dealerCard2Face}`
            }
            className="w-32 transform"
            alt="Dealer Card 2"
          />
        </div>
      </main>
    </div>
  );
};

export default BlackjackGame;
