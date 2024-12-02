import React from "react";

const GameBar = () => {
  return (
    <>
      <div className="mt-6 mx-6 md:mx-16 min-h-[80vh] border border-slate-600 rounded">
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
          <div className="w-36 h-56 bg-slate-700 rounded transition hover:opacity-50 duration-300 ease-in-out transform hover:scale-105"></div>
          <div className="w-36 h-56 bg-slate-700 rounded transition hover:opacity-50 duration-300 ease-in-out transform hover:scale-105"></div>
          <div className="w-36 h-56 bg-slate-700 rounded transition hover:opacity-50 duration-300 ease-in-out transform hover:scale-105"></div>
        </div>
      </div>
    </>
  );
};

export default GameBar;
