"use client";
import React from "react";
import { signOut } from "next-auth/react";

const Dashboard = () => {
  return (
    <>
      <nav className="mt-6 mx-6 md:mx-9 topBar flex items-center">
        <img src="/logo.png" alt="Logo" className="w-20" />
        <div className="p-2 px-4 flex w-full rounded-lg shadow-lg justify-between items-center">
          <h2 className="font-bold text-2xl">Ace-X</h2>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-gray-300 opacity-60 hover:bg-purple-500 hover:text-white hover:opacity-100 font-bold text-xs text-black py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="mt-10">
        <h1>Dashboard</h1>
      </div>
    </>
  );
};

export default Dashboard;
