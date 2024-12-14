"use client";
import React from "react";
import Navbar from "./components/Navbar";
import GameBar from "./components/GameBar";

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <GameBar />
      <p id="credit" className="bottom-0 absolute text-sm">
        Created by:{" "}
        <a
          href="https://github.com/MaxwellWhoSquats"
          className="text-blue-400 hover:text-base hover:text-blue-600"
        >
          Maxwell Eley
        </a>
      </p>
    </>
  );
};

export default Dashboard;
