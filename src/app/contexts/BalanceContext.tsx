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
  netBalance: number | string; // Net balance since account creation
  setBalance: (newBalance: number | string) => void;
  setNetBalance: (newNetBalance: number | string) => void;
  updateBalance: (amount: number) => Promise<void>; // Amount in cents
}

const BalanceContext = createContext<BalanceContextProps | undefined>(
  undefined
);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | string>("...");
  const [netBalance, setNetBalance] = useState<number | string>("...");

  useEffect(() => {
    if (session?.user?.email) {
      // Fetch the balance and netBalance from the database when the user is authenticated
      axios
        .get("/api/balance")
        .then((response: { data: { balance: number; netBalance: number } }) => {
          setBalance(response.data.balance);
          setNetBalance(response.data.netBalance);
          console.log(
            `Fetched Balance: ${response.data.balance} cents, Net Balance: ${response.data.netBalance} cents`
          );
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

      try {
        const response = await axios.patch("/api/balance", { amount });
        if (response.status === 200) {
          const { balance: newBalance, netBalance: newNetBalance } =
            response.data;
          setBalance(newBalance);
          setNetBalance(newNetBalance);
          console.log(
            `Balance updated: ${newBalance} cents, Net Balance: ${newNetBalance} cents`
          );
        }
      } catch (error: any) {
        console.error("Failed to update balance:", error);
        alert("Failed to update balance. Please try again.");
      }
    },
    [session, balance]
  );

  return (
    <BalanceContext.Provider
      value={{ balance, netBalance, setBalance, setNetBalance, updateBalance }}
    >
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
