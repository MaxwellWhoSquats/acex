import React, { useState, useEffect, useRef } from "react";

const Honeybear: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/forest.wav");
      audioRef.current.volume = 0.2;
      audioRef.current.loop = true;
    }

    const playAudio = setTimeout(() => {
      audioRef.current
        ?.play()
        .catch((error) => console.error("Error playing audio:", error));
    }, 500);

    return () => {
      clearTimeout(playAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-1/5 bg-slate-600 p-2">
        <h2 className="text-sm mb-1">Bet Amount</h2>
        <section id="bet" className="flex h-8 space-x-2 mb-3">
          <div className="bg-slate-800 w-full flex rounded p-2 items-center">
            <input
              className="w-full bg-transparent outline-none text-white"
              placeholder="0"
              type="number"
              min="0"
              step="1"
            />
            <img src="/coin.png" className="w-7 h-7 mb-0.5" alt="Coin" />
          </div>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            1/2
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            2x
          </button>
        </section>
        <h2 className="text-sm mb-1">Difficulty</h2>
        <section id="asteroids-selector" className="flex h-8 mb-6">
          <div
            className={`bg-slate-800 w-full flex rounded p-2 items-center
            ${gameStarted ? "bg-opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              className="w-full bg-transparent outline-none text-white"
              disabled={gameStarted}
              defaultValue={3}
              type="number"
              min="3"
              max="24"
            />
          </div>
        </section>
        {!gameOver && (
          <button
            className={`w-full bg-purple-500 p-4 rounded font-bold text-white
            ${
              gameStarted
                ? "bg-opacity-50 cursor-not-allowed"
                : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300"
            }`}
            disabled={gameStarted}
          >
            {gameStarted ? "Betting..." : "Bet"}
          </button>
        )}
        {gameOver && (
          <button
            className={`w-full bg-purple-500 p-4 rounded font-bold text-white
              ${
                gameStarted
                  ? "bg-opacity-50 cursor-not-allowed"
                  : "transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300"
              }`}
          >
            Bet Again
          </button>
        )}
        {gameStarted && !hasCashedOut && (
          <button className="w-full mt-6 bg-green-500 p-2 rounded font-bold text-white transition-all duration-200 transform active:scale-95 hover:bg-green-600 hover:text-gray-300">
            Cashout
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 relative overflow-hidden">
        {/* Background Images for Large Screens and Above */}
        <div className="hidden xl:block w-full h-full relative">
          {/* Forest Image */}
          <img
            src="/forest.svg"
            className="w-full h-full object-cover"
            alt="Forest"
          />

          {/* Tree Overlay */}
          <img
            src="/tree.svg"
            className="absolute top-0 left-20 w-[100%] h-[100%] scale-125 object-cover z-10"
            alt="Honeybear"
          />
        </div>
        {/* Fallback Message for Screens Below Large */}
        <div className="xl:hidden w-full h-full bg-slate-900 flex items-center justify-center">
          <p className="text-white text-lg text-center px-4">
            Please view on a larger screen.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Honeybear;
