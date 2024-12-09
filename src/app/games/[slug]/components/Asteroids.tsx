import React from "react";

const Asteroids = () => {
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
              onChange={(e) => {
                const inputValue = e.target.value;
                const parsedValue = inputValue === "" ? 0 : Number(inputValue);
              }}
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
        <section id="blackjack-actions" className="grid grid-cols-3 gap-2 mb-3">
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Hit
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Stand
          </button>
          <button className="bg-slate-500 p-2 rounded text-xs font-bold text-white hover:bg-slate-700 hover:text-gray-300 transition-all duration-200 transform active:scale-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Double
          </button>
        </section>
        <button className="w-full bg-purple-500 p-2 rounded font-bold text-white transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:bg-purple-600 hover:text-gray-300 cursor-pointer">
          Bet
        </button>
      </aside>
      <main className="flex flex-1 bg-slate-800 relative justify-center items-center">
        <div
          id="board"
          className="grid grid-cols-5 gap-3 z-10"
          style={{
            width: "65vmin",
            height: "65vmin",
          }}
        >
          {Array.from({ length: 25 }).map((_, index) => (
            <div
              key={index}
              className="bg-purple-300 bg-opacity-20 backdrop-blur-lg border border-white border-opacity-10 rounded-xl hover:bg-opacity-10 hover:scale-95 transition-all duration-200 z-50"
            ></div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Asteroids;
