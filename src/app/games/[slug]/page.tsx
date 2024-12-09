"use client";
import { useParams } from "next/navigation";
import games from "@/data/games.json";
import dynamic from "next/dynamic";
import Navbar from "@/app/components/Navbar";

const BlackjackGame = dynamic(() => import("./components/BlackjackGame"));

const GamePage = () => {
  const { slug } = useParams();
  const game = games.find((game) => game.slug === slug);

  if (!game) {
    // Handle invalid slugs
    return <div className="text-white text-center">Game not found.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="mt-6 mx-auto w-3/4 h-[80vh] flex justify-center border border-slate-600 rounded">
        {slug === "blackjack" && <BlackjackGame />}
        {/* {slug === "dragon-tower" && <DragonTowerGame />} */}
      </div>
    </>
  );
};

export default GamePage;
