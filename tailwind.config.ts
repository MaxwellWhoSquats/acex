import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        moveDown: {
          "0%": { top: "0%", right: "0%", transform: "translate(0, 0)" },
          "100%": { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        flipCard: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
      },
      animation: {
        move: "moveDown 1s forwards",
        flip: "flipCard 0.6s forwards",
      },
      transformOrigin: {
        center: "center",
      },
    },
  },
  plugins: [],
};
export default config;
