"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface BalanceContextProps {
  balance: number;
  setBalance: (newBalance: number) => void;
  updateBalance: (amount: number) => Promise<void>;
}

const BalanceContext = createContext<BalanceContextProps | undefined>(
  undefined
);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (session?.user?.email) {
      // Fetch the balance from the database when the user is authenticated
      axios
        .get("/api/balance")
        .then((response: { data: { balance: number } }) => {
          setBalance(response.data.balance);
        })
        .catch((error: any) => {
          console.error("Failed to fetch balance:", error);
        });
    }
  }, [session]);

  const updateBalance = async (amount: number) => {
    if (!session?.user?.email) return;

    const newBalance = balance + amount;
    setBalance(newBalance);

    try {
      await axios.post("/api/balance", { balance: newBalance });
    } catch (error) {
      console.error("Failed to update balance:", error);
      // Optionally revert the balance if the update fails
      setBalance(balance);
    }
  };

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
