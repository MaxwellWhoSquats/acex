import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="mt-6 mx-6 md:mx-9 topBar flex items-center">
      <img src="/logo.png" alt="Logo" className="w-20" />
      <div className="p-2 px-4 flex w-full rounded-lg shadow-lg justify-between items-center">
        <h2 className="font-bold text-2xl">Ace-X</h2>
      </div>
    </nav>
  );
};

export default Navbar;
