import { useState, useCallback } from "react";

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
  hit: () => Promise<boolean>;
  stand: () => Promise<void>;
  handValue: (hand: string[]) => number;
  playerHas21: boolean;
  gameOver: boolean;
  gameStarted: boolean;
  dealerTurn: boolean;
  dealerDoneDrawing: boolean;
  playerHasBlackjack: boolean;
  dealerHasBlackjack: boolean;
  gameResult: "WIN" | "LOSE" | "PUSH" | "";
  resetGame: () => void;
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

export const handValue = (hand: string[]): number => {
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

// Shuffle function
const shuffleDeck = (deck: string[]): string[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useBlackjack = (bet: number): UseBlackjackReturn => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerHas21, setPlayerHas21] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [dealerTurn, setDealerTurn] = useState<boolean>(false);
  const [dealerDoneDrawing, setDealerDoneDrawing] = useState<boolean>(false);
  const [playerHasBlackjack, setPlayerHasBlackjack] = useState<boolean>(false);
  const [dealerHasBlackjack, setDealerHasBlackjack] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<"WIN" | "LOSE" | "PUSH" | "">("");

  // Initialize a fresh deck for each game
  const [deck, setDeck] = useState<string[]>(shuffleDeck(createDeck()));

  const playerScore = handValue(playerHand.map((card) => card.name));
  const dealerScore = handValue(dealerHand.map((card) => card.name));

  const dealCards = useCallback((): void => {
    setPlayerHas21(false);
    setGameOver(false);
    setGameStarted(true);
    setDealerTurn(false);
    setDealerDoneDrawing(false);
    setGameResult("");
    setPlayerHasBlackjack(false);
    setDealerHasBlackjack(false);

    // Shuffle and reset deck
    const shuffledDeck = shuffleDeck(createDeck());

    // Draw cards from shuffledDeck
    const newDeck = [...shuffledDeck];
    const drawCard = (): Card => {
      if (newDeck.length === 0) {
        // Reset deck if out of cards
        const newShuffledDeck = shuffleDeck(createDeck());
        newDeck.push(...newShuffledDeck);
      }
      const cardName = newDeck.shift()!;
      return {
        id: generateUniqueID(),
        name: cardName,
      };
    };

    const newPlayerHand: Card[] = [drawCard(), drawCard()];
    const newDealerHand: Card[] = [drawCard(), drawCard()];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setDeck(newDeck);

    const initialPlayerScore = handValue(newPlayerHand.map((card) => card.name));
    const initialDealerScore = handValue(newDealerHand.map((card) => card.name));

    // Check for immediate blackjack
    if (initialPlayerScore === 21 && initialDealerScore === 21) {
      setGameStarted(false);
      setGameResult("PUSH");
      setGameOver(true);
      return;
    }

    if (initialPlayerScore === 21) {
      setPlayerHasBlackjack(true);
      setPlayerHas21(true);
      setGameStarted(false);
      setGameResult("WIN");
      setGameOver(true);
      return;
    }

    if (initialDealerScore === 21) {
      setDealerHasBlackjack(true);
      setGameStarted(false);
      setGameResult("LOSE");
      setGameOver(true);
      return;
    }

    console.log("Initial bet:", bet);
  }, [bet]);

  const hit = useCallback(async (): Promise<boolean> => {
    if (!gameStarted) return false;

    if (deck.length === 0) {
      alert("No more cards in the deck!");
      return false;
    }

    const cardIndex = Math.floor(Math.random() * deck.length);
    const cardName = deck[cardIndex];
    const updatedDeck = [...deck];
    updatedDeck.splice(cardIndex, 1);
    setDeck(updatedDeck);

    const newCard: Card = {
      id: generateUniqueID(),
      name: cardName,
    };

    let canContinue = true;

    setPlayerHand((prevHand) => {
      const updatedHand = [...prevHand, newCard];
      const playerValue = handValue(updatedHand.map((card) => card.name));

      if (playerValue > 21) {
        setGameStarted(false);
        setGameResult("LOSE");
        setGameOver(true);
        canContinue = false;
      } else if (playerValue === 21) {
        setPlayerHas21(true);
        // Optionally, you can trigger stand here if desired
      }
      return updatedHand;
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    return canContinue;
  }, [gameStarted, deck]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const stand = useCallback(async (): Promise<void> => {
    if (!gameStarted) return;

    setDealerTurn(true);

    let currentDealerHand = [...dealerHand];
    let dealerValue = handValue(currentDealerHand.map((card) => card.name));

    while (dealerValue < 17) {
      await delay(1000); // Wait for animation

      if (deck.length === 0) {
        alert("No more cards in the deck!");
        break;
      }

      const cardIndex = Math.floor(Math.random() * deck.length);
      const cardName = deck[cardIndex];
      const updatedDeck = [...deck];
      updatedDeck.splice(cardIndex, 1); // Remove the drawn card from the deck
      setDeck(updatedDeck);

      const newCard: Card = {
        id: generateUniqueID(),
        name: cardName,
      };

      currentDealerHand = [...currentDealerHand, newCard];
      setDealerHand(currentDealerHand);
      dealerValue = handValue(currentDealerHand.map((card) => card.name));
    }

    // Dealer done drawing now
    setDealerDoneDrawing(true);

    const playerValue = handValue(playerHand.map((card) => card.name));

    if (dealerValue > 21) {
      setGameResult("WIN");
    } else if (playerValue > 21) {
      setGameResult("LOSE");
    } else if (playerValue === dealerValue) {
      setGameResult("PUSH");
    } else if (playerValue > dealerValue) {
      setGameResult("WIN");
    } else {
      setGameResult("LOSE");
    }

    await delay(2000); // Wait before ending the game
    setGameStarted(false);
    setGameOver(true);
  }, [gameStarted, dealerHand, deck, playerHand]);

  const resetGame = useCallback(() => {
    setGameResult("");
    setDealerTurn(false);
    setDealerDoneDrawing(false);
    setDealerHasBlackjack(false);
    setPlayerHas21(false);
    setPlayerHand([]);
    setDealerHand([]);
    setDeck(shuffleDeck(createDeck()));
    setGameOver(false);
    setGameStarted(false);
  }, []);

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
    dealerDoneDrawing,
    playerHasBlackjack,
    dealerHasBlackjack,
    gameResult,
    resetGame,
  };
};
