import { useState } from "react";

function createCardNames() {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
    "ace",
  ];
  const cardNames: string[] = [];

  suits.forEach((suit) => {
    values.forEach((value) => {
      cardNames.push(`${value}_of_${suit}`);
    });
  });

  return cardNames;
}

function handValue(hand: string[]) {
  let value = 0;
  let aces = 0;

  hand.forEach((card) => {
    const cardValue = card.split("_")[0];

    if (cardValue === "ace") {
      aces++;
    } else if (["jack", "queen", "king"].includes(cardValue)) {
      value += 10;
    } else {
      value += parseInt(cardValue);
    }
  });

  while (aces > 0) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
    aces--;
  }

  return value;
}

export const useBlackjack = () => {
  const [playerHand, setPlayerHand] = useState<string[]>([]);
  const [dealerHand, setDealerHand] = useState<string[]>([]);
  const [playerHas21, setPlayerHas21] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const cards = createCardNames();

  const dealCards = () => {
    const newPlayerHand = [
      cards[Math.floor(Math.random() * cards.length)],
      cards[Math.floor(Math.random() * cards.length)],
    ];
    const newDealerHand = [
      cards[Math.floor(Math.random() * cards.length)],
      cards[Math.floor(Math.random() * cards.length)],
    ];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);

    console.log("Player hand:", newPlayerHand);
    console.log("Dealer hand:", newDealerHand);

    const playerValue = handValue(newPlayerHand);
    const dealerValue = handValue(newDealerHand);

    if (playerValue === 21) {
      setPlayerHas21(true);
      console.log("Player has Blackjack!");
    }
  };

  const hit = () => {
    if (gameOver) return;

    const newCard = cards[Math.floor(Math.random() * cards.length)];
    setPlayerHand((prevHand) => {
      const updatedHand = [...prevHand, newCard];

      const playerValue = handValue(updatedHand);
      if (playerValue > 21) {
        setGameOver(true);
      } else if (playerValue === 21) {
        setPlayerHas21(true);
        setGameOver(true);
      }

      return updatedHand;
    });
  };

  return {
    playerHand,
    dealerHand,
    dealCards,
    hit,
    playerHas21,
    gameOver,
  };
};
