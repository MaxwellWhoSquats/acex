import Link from "next/link";
import React from "react";
import { signOut } from "next-auth/react";
import { useBalance } from "../contexts/BalanceContext";

const Navbar = () => {
  const { balance } = useBalance();

  return (
    <nav className="mt-6 mx-6 md:mx-9 topBar flex items-center">
      <img src="/logo.png" alt="Logo" className="w-20" />
      <div className="p-2 px-4 flex w-full rounded-lg shadow-lg justify-between items-center">
        <h2 className="font-bold text-2xl">Ace-X</h2>
        <section
          id="balance"
          className="absolute left-1/2 transform -translate-x-1/2 flex"
        >
          <div className="bg-slate-800 p-2 w-24 rounded-l flex items-center justify-center">
            <p className="text-white font-bold">{`$${balance}`}</p>
          </div>
          <Link
            href={"/wallet"}
            className="bg-purple-600 p-2 rounded-r flex items-center justify-center hover:bg-purple-800"
          >
            <p className="text-white font-bold text-sm">Wallet</p>
          </Link>
        </section>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-gray-300 opacity-60 hover:bg-purple-600 hover:text-white hover:opacity-100 font-bold text-xs text-black py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
