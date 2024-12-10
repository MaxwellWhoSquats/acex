"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface BalanceContextProps {
  balance: number | string; // Balance in cents
  setBalance: (newBalance: number | string) => void;
  updateBalance: (amount: number) => Promise<void>; // Amount in cents
}

const BalanceContext = createContext<BalanceContextProps | undefined>(
  undefined
);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | string>("...");

  useEffect(() => {
    if (session?.user?.email) {
      // Fetch the balance from the database when the user is authenticated
      axios
        .get("/api/balance")
        .then((response: { data: { balance: number } }) => {
          setBalance(response.data.balance);
          console.log(`Fetched Balance: ${response.data.balance} cents`);
        })
        .catch((error: any) => {
          console.error("Failed to fetch balance:", error);
        });
    }
  }, [session]);

  const updateBalance = useCallback(
    async (amount: number) => {
      if (!session?.user?.email || typeof balance !== "number") {
        console.error(
          "Cannot update balance: User not authenticated or balance invalid."
        );
        return;
      }

      const newBalance = parseFloat((balance + amount).toFixed(2)); // Round to 2 decimal places
      if (newBalance < 0) {
        alert("Insufficient balance.");
        return;
      }

      console.log(`Updating Balance: ${balance} + ${amount} = ${newBalance}`);
      setBalance(newBalance);

      try {
        const response = await axios.patch("/api/balance", { amount });
        setBalance(parseFloat(response.data.balance.toFixed(2)));
        console.log(`Balance updated on server: ${response.data.balance}`);
      } catch (error: any) {
        console.error("Failed to update balance:", error);
        setBalance(balance); // Revert to previous balance
        alert("Failed to update balance. Please try again.");
      }
    },
    [session, balance]
  );

  return (
    <BalanceContext.Provider value={{ balance, setBalance, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};
