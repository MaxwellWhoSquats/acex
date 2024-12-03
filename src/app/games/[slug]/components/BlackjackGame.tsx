import React, { useState } from "react";

const BlackjackGame = () => {
  const [dealtCards, setDealtCards] = useState([]);
  const deck = [
    "ace_of_spades",
    "2_of_spades",
    "3_of_spades",
    "4_of_spades",
    "5_of_spades",
    "6_of_spades",
    "7_of_spades",
    "8_of_spades",
    "9_of_spades",
    "10_of_spades",
    "jack_of_spades",
    "queen_of_spades",
    "king_of_spades",
    "ace_of_hearts",
    "2_of_hearts",
    "3_of_hearts",
    "4_of_hearts",
    "5_of_hearts",
    "6_of_hearts",
    "7_of_hearts",
    "8_of_hearts",
    "9_of_hearts",
    "10_of_hearts",
    "jack_of_hearts",
    "queen_of_hearts",
    "king_of_hearts",
    "ace_of_clubs",
    "2_of_clubs",
    "3_of_clubs",
    "4_of_clubs",
    "5_of_clubs",
    "6_of_clubs",
    "7_of_clubs",
    "8_of_clubs",
    "9_of_clubs",
    "10_of_clubs",
    "jack_of_clubs",
    "queen_of_clubs",
    "king_of_clubs",
    "ace_of_diamonds",
    "2_of_diamonds",
    "3_of_diamonds",
    "4_of_diamonds",
    "5_of_diamonds",
    "6_of_diamonds",
    "7_of_diamonds",
    "8_of_diamonds",
    "9_of_diamonds",
    "10_of_diamonds",
    "jack_of_diamonds",
    "queen_of_diamonds",
    "king_of_diamonds",
  ];

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
            <img src="/coin.png" className="w-7 h-7 mb-0.5" />
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
        <button className="w-full bg-purple-500 p-2 rounded font-bold text-white hover:bg-purple-600 hover:text-gray-300 transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 hover:shadow-lg">
          Bet
        </button>
      </aside>
      <main className="flex-1 bg-slate-800 relative">
        <img
          src="/cardback.png"
          className="w-32 mt-5 mr-5 transform rotate-180 absolute top-0 right-0"
        />
      </main>
    </div>
  );
};

export default BlackjackGame;
