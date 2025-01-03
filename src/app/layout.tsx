import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import { AuthProvider } from "./Providers";
import { BalanceProvider } from "../app/contexts/BalanceContext";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Ace-X",
  description: "Online Minigame Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${orbitron.className} bg-gradient-to-b from-slate-950 to-slate-700`}
      >
        <AuthProvider>
          <BalanceProvider>{children}</BalanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
