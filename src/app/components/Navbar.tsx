import { Inter } from "next/font/google";
import React, { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";
import { useBalance } from "../contexts/BalanceContext";
import axios from "axios";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const Navbar = () => {
  const { balance, setBalance } = useBalance();
  const [canRefill, setCanRefill] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loadingRefillStatus, setLoadingRefillStatus] = useState<boolean>(true);
  const [showWalletMenu, setShowWalletMenu] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayBalance =
    typeof balance === "number" ? `${(balance / 100).toFixed(2)}` : "...";

  // Fetch refill status on mount
  useEffect(() => {
    const fetchRefillStatus = async () => {
      try {
        const response = await axios.get("/api/refill-status");
        if (response.data.canRefill) {
          setCanRefill(true);
          setTimeRemaining(null);
        } else {
          setCanRefill(false);
          setTimeRemaining(response.data.timeRemaining);
        }
      } catch (error) {
        console.error("Failed to fetch refill status:", error);
      } finally {
        setLoadingRefillStatus(false);
      }
    };

    fetchRefillStatus();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev > 1000) {
            return prev - 1000;
          } else {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setCanRefill(true);
            return null;
          }
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining]);

  const handleRefill = async () => {
    try {
      const response = await axios.post("/api/refill");
      if (response.status === 200) {
        const { balance: newBalance } = response.data;
        setBalance(newBalance);
        setCanRefill(false);
        // Start a fresh 1-hour countdown
        setTimeRemaining(60 * 60 * 1000);
        alert("Refill successful! Balance updated.");
      }
    } catch (error: any) {
      console.error("Refill failed:", error);
      if (
        error.response &&
        error.response.data?.error === "Refill not yet available"
      ) {
        setCanRefill(false);
        setTimeRemaining(error.response.data.timeRemaining);
      } else {
        alert("Refill failed. Please try again.");
      }
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowWalletMenu(false);
      }
    };
    if (showWalletMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWalletMenu]);

  return (
    <nav className="mt-6 mx-6 md:mx-9 topBar flex items-center">
      <img src="/logo.png" alt="Logo" className="w-20" />
      <div className="p-2 px-4 flex w-full rounded-lg shadow-lg justify-between items-center relative">
        <h2 className="font-bold text-2xl">Ace-X</h2>
        <section
          id="balance"
          className="absolute left-1/2 transform -translate-x-1/2 flex"
        >
          <div
            className="bg-slate-800 p-2 w-32 rounded-l flex items-center justify-center cursor-pointer"
            onClick={() => setShowWalletMenu((prev) => !prev)}
          >
            <img src="/coin.png" alt="Coin" className="w-6 mr-1" />
            <p className={`${inter.className} text-white font-bold`}>
              {displayBalance}
            </p>
          </div>
          <div
            className="bg-purple-600 p-2 px-3 rounded-r flex items-center justify-center hover:bg-purple-800 cursor-pointer"
            onClick={() => setShowWalletMenu((prev) => !prev)}
          >
            <p className="text-white font-bold text-sm">Wallet</p>
          </div>
        </section>

        <div id="right-section" className="flex items-center">
          {/* Home button restored */}
          <a
            href="/"
            className="mr-3 bg-purple-300 opacity-60 hover:bg-purple-600 hover:text-white hover:opacity-100 font-bold text-xs text-black py-2 px-4 rounded transition-all duration-200"
          >
            Home
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mr-3 bg-gray-300 opacity-60 hover:bg-purple-600 hover:text-white hover:opacity-100 font-bold text-xs text-black py-2 px-4 rounded transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {showWalletMenu && (
          <div
            ref={menuRef}
            className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-64 bg-slate-700 rounded shadow-lg p-4 z-50"
          >
            <h3 className="font-bold text-lg mb-2">Wallet</h3>
            {!loadingRefillStatus && (
              <div className="mb-2">
                {canRefill ? (
                  <button
                    onClick={handleRefill}
                    className="bg-green-500 text-white font-bold text-xs py-2 px-4 rounded hover:bg-green-600 transition-all duration-200 w-full"
                  >
                    Refill
                  </button>
                ) : timeRemaining !== null ? (
                  <button
                    disabled
                    className="bg-gray-400 text-white font-bold text-xs py-2 px-4 rounded opacity-50 cursor-not-allowed w-full"
                    title="Refill not available yet."
                  >
                    Refill in {formatTime(timeRemaining)}
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-400 text-white font-bold text-xs py-2 px-4 rounded opacity-50 cursor-not-allowed w-full"
                  >
                    Checking...
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => setShowWalletMenu(false)}
              className="text-sm text-blue-500 underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
