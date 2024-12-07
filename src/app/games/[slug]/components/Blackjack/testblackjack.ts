import { useState } from "react";

interface Card {
  id: string;
  name: string;
}

interface UseBlackjackReturn {
  playerHand: Card[];
  dealerHand: Card[];
  dealCards: () => void;
  hit: () => void;
  stand: () => void;
  playerHas21: boolean;
  gameOver: boolean;
  gameStarted: boolean;
  dealerTurn: boolean;
  winnerMessage: string;
}

const SUITS = ["hearts", "diamonds", "clubs", "spades"] as const;
const VALUES = [
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
] as const;

const createDeck = (): string[] => {
  return SUITS.flatMap((suit) => VALUES.map((value) => `${value}_of_${suit}`));
};

const handValue = (hand: string[]): number => {
  let value = 0;
  let aces = 0;

  hand.forEach((card) => {
    const cardValue = card.split("_")[0];

    if (cardValue === "ace") {
      aces += 1;
    } else if (["jack", "queen", "king"].includes(cardValue)) {
      value += 10;
    } else {
      value += parseInt(cardValue, 10);
    }
  });

  while (aces > 0) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
    aces -= 1;
  }

  return value;
};

const generateUniqueID = (): string => {
  return "c_" + Math.random().toString(36).substr(2, 9);
};

export const useBlackjack = (): UseBlackjackReturn => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerHas21, setPlayerHas21] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [dealerTurn, setDealerTurn] = useState<boolean>(false);
  const [winnerMessage, setWinnerMessage] = useState<string>("");

  const deck = createDeck();

  const dealCards = (): void => {
    setPlayerHas21(false);
    setGameOver(false);
    setGameStarted(true);
    setDealerTurn(false);
    setWinnerMessage("");

    const drawCard = () => ({
      id: generateUniqueID(),
      name: deck[Math.floor(Math.random() * deck.length)],
    });

    const newPlayerHand: Card[] = [drawCard(), drawCard()];
    const newDealerHand: Card[] = [drawCard(), drawCard()];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);

    const playerScore = handValue(newPlayerHand.map((card) => card.name));
    const dealerScore = handValue(newDealerHand.map((card) => card.name));

    // Check for immediate blackjack
    if (playerScore === 21 && dealerScore === 21) {
      setWinnerMessage("It's a push.");
      setGameOver(true);
      setGameStarted(false);
      return;
    }

    if (playerScore === 21) {
      setWinnerMessage("Player has Blackjack!");
      setPlayerHas21(true);
      setGameOver(true);
      setGameStarted(false);
      return;
    }

    if (dealerScore === 21) {
      setWinnerMessage("Dealer has Blackjack!");
      setGameOver(true);
      setGameStarted(false);
      return;
    }
  };

  const hit = (): void => {
    if (!gameStarted) return;

    const newCard: Card = {
      id: generateUniqueID(),
      name: deck[Math.floor(Math.random() * deck.length)],
    };

    setPlayerHand((prevHand) => {
      const updatedHand = [...prevHand, newCard];
      const playerValue = handValue(updatedHand.map((card) => card.name));

      if (playerValue > 21) {
        setWinnerMessage("You busted! Dealer wins.");
        setGameOver(true);
        setGameStarted(false);
      } else if (playerValue === 21) {
        setWinnerMessage("You have 21!");
        setGameOver(true);
        setGameStarted(false);
      }

      return updatedHand;
    });
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const stand = async (): Promise<void> => {
    if (!gameStarted) return;

    setGameStarted(false);
    setDealerTurn(true);

    let currentDealerHand = [...dealerHand];
    let dealerValue = handValue(currentDealerHand.map((card) => card.name));

    while (dealerValue < 17) {
      await delay(1000);

      const newCard: Card = {
        id: generateUniqueID(),
        name: deck[Math.floor(Math.random() * deck.length)],
      };

      currentDealerHand = [...currentDealerHand, newCard];
      dealerValue = handValue(currentDealerHand.map((card) => card.name));

      setDealerHand(currentDealerHand);
    }

    const playerValue = handValue(playerHand.map((card) => card.name));

    // Determine the outcome
    if (dealerValue > 21) {
      setWinnerMessage("Dealer busted! You win!");
    } else if (playerValue > 21) {
      setWinnerMessage("You busted! Dealer wins.");
    } else if (playerValue === dealerValue) {
      setWinnerMessage("It's a push.");
    } else if (playerValue > dealerValue) {
      setWinnerMessage("You win!");
    } else {
      setWinnerMessage("You lose!");
    }

    setGameOver(true);
    await delay(1000);
    setDealerTurn(false);
  };

  return {
    playerHand,
    dealerHand,
    dealCards,
    hit,
    stand,
    playerHas21,
    gameOver,
    gameStarted,
    dealerTurn,
    winnerMessage,
  };
};
