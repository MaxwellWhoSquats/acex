"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import games from "@/data/games.json";
import dynamic from "next/dynamic";
import Navbar from "@/app/components/Navbar";
import { gsap } from "gsap";

const BlackjackGame = dynamic(() => import("./components/BlackjackGame"));
const AsteroidsGame = dynamic(() => import("./components/Asteroids"));

const GamePage = () => {
  const { slug } = useParams();
  const game = games.find((game) => game.slug === slug);

  useEffect(() => {
    if (game) {
      const timeline = gsap.timeline();
      timeline.fromTo(
        ".game",
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          delay: 0.5,
          ease: "power3.out",
        }
      );
    }
  }, [game]);

  if (!game) {
    // Handle invalid slugs
    return <div className="text-white text-center">Game not found.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="game mt-6 mx-auto w-3/4 h-[80vh] flex justify-center border border-slate-600 rounded">
        {slug === "blackjack" && <BlackjackGame />}
        {slug === "asteroids" && <AsteroidsGame />}
      </div>
    </>
  );
};

export default GamePage;
