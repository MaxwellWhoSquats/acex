import { useState } from "react";

interface Card {
  id: string;
  name: string;
}

interface UseBlackjackReturn {
  playerHand: Card[];
  dealerHand: Card[];
  playerScore: number;
  dealerScore: number;
  dealCards: () => void;
  hit: () => void;
  stand: () => void;
  handValue: (hand: string[]) => number;
  playerHas21: boolean;
  gameOver: boolean;
  gameStarted: boolean;
  dealerTurn: boolean;
  winnerMessage: string;
  dealerDoneDrawing: boolean; // Indicates dealer finished drawing
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
  const [dealerDoneDrawing, setDealerDoneDrawing] = useState<boolean>(false); // NEW

  // Initialize a fresh deck for each game
  const [deck, setDeck] = useState<string[]>(createDeck());

  const playerScore = handValue(playerHand.map((card) => card.name));
  const dealerScore = handValue(dealerHand.map((card) => card.name));

  const shuffleDeck = (deck: string[]): string[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const dealCards = (): void => {
    setPlayerHas21(false);
    setGameOver(false);
    setGameStarted(true);
    setDealerTurn(false);
    setWinnerMessage("");
    setDealerDoneDrawing(false);

    // Shuffle and reset deck
    const shuffledDeck = shuffleDeck(createDeck());
    setDeck(shuffledDeck);

    const drawCard = (): Card => {
      if (deck.length === 0) {
        // Reset deck if out of cards
        setDeck(shuffleDeck(createDeck()));
        return drawCard();
      }
      const cardName = deck[Math.floor(Math.random() * deck.length)];
      return {
        id: generateUniqueID(),
        name: cardName,
      };
    };

    const newPlayerHand: Card[] = [drawCard(), drawCard()];
    const newDealerHand: Card[] = [drawCard(), drawCard()];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);

    const initialPlayerScore = handValue(newPlayerHand.map((card) => card.name));
    const initialDealerScore = handValue(newDealerHand.map((card) => card.name));

    // Check for immediate blackjack
    if (initialPlayerScore === 21 && initialDealerScore === 21) {
      setWinnerMessage("It's a push.");
      setGameStarted(false);
      return;
    }

    if (initialPlayerScore === 21) {
      setWinnerMessage("Player has Blackjack!");
      setPlayerHas21(true);
      setGameStarted(false);
      return;
    }

    if (initialDealerScore === 21) {
      setWinnerMessage("Dealer has Blackjack!");
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
        setGameStarted(false);
      }
      return updatedHand;
    });
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const stand = async (): Promise<void> => {
    if (!gameStarted) return;

    setDealerTurn(true);

    let currentDealerHand = [...dealerHand];
    let dealerValue = handValue(currentDealerHand.map((card) => card.name));

    while (dealerValue < 17) {
      await delay(1000); // Wait for animation

      const newCard: Card = {
        id: generateUniqueID(),
        name: deck[Math.floor(Math.random() * deck.length)],
      };

      currentDealerHand = [...currentDealerHand, newCard];
      setDealerHand(currentDealerHand);
      dealerValue = handValue(currentDealerHand.map((card) => card.name));
    }

    // Dealer done drawing now
    setDealerDoneDrawing(true);

    const playerValue = handValue(playerHand.map((card) => card.name));

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

    setTimeout(() => {
      setGameStarted(false);
    }, 2000);
  };

  return {
    playerHand,
    dealerHand,
    playerScore,
    dealerScore,
    dealCards,
    hit,
    stand,
    handValue,
    playerHas21,
    gameOver,
    gameStarted,
    dealerTurn,
    winnerMessage,
    dealerDoneDrawing,
  };
};
