import Link from "next/link";
import React from "react";

const GameBar = () => {
  return (
    <>
      <div className="mt-6 mx-6 md:mx-24 lg:mx-56 min-h-[80vh] border border-slate-600 rounded">
        <section
          id="heading"
          className="flex items-center ml-5 mt-5 pb-3 space-x-6 border-b border-slate-600 w-max"
        >
          <h1 className="font-bold text-xl">Games</h1>
          <div className="flex items-center">
            <input
              type="text"
              className="w-44 p-1 border border-slate-600 rounded bg-slate-950 focus:outline-none"
              placeholder="Search..."
            />
          </div>
        </section>
        <div className="flex space-x-3 mx-5 mt-8">
          <Link
            href={`/games/blackjack`}
            className="w-40 bg-slate-700 border-4 border-purple-950 text-white rounded shadow hover:scale-105 transition ease-in-out"
          >
            <img src="/blackjacklogo.jpeg" alt="Blackjack" />
          </Link>
          <Link
            href={`/games/asteroids`}
            className="w-40 bg-slate-700 border-4 border-purple-950 text-white rounded shadow hover:scale-105 transition ease-in-out"
          >
            <img src="/asteroidslogo.jpeg" alt="Asteroids" />
          </Link>
          <Link
            href={`/games/honeybear`}
            className="w-40 bg-slate-700 text-white rounded shadow hover:scale-105 hover:opacity-50 transition ease-in-out"
          ></Link>
        </div>
      </div>
    </>
  );
};

export default GameBar;
