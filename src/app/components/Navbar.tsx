import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="mt-6 mx-6 md:mx-9 topBar flex items-center">
      <img src="/logo.png" alt="Logo" className="w-20" />
      <div className="p-2 px-4 flex w-full rounded-lg shadow-lg justify-between items-center">
        <h2 className="font-bold text-2xl">Ace-X</h2>
        <Link href="/profile">
          <p className="ml-4 py-1 px-3 bg-gray-200 text-gray-800 rounded hover:bg-purple-500 hover:text-white font-bold text-sm">
            Profile
          </p>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
