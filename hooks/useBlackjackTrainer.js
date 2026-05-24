import { useCallback, useEffect, useRef, useState } from "react";
import {
  shuffleDeck,
  calculateHandValue,
  dealerShouldHit,
  getOptimalMove as getOptimalMoveCore,
} from "@/lib/trainerUtils";
import { createDeck } from "@/lib/trainerHelpers";

const STRATEGY_OPTS = { allowSurrender: false };
const DEALER_HITS_SOFT17 = false;

export function useBlackjackTrainer() {
  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [revealDealer, setRevealDealer] = useState(false);
  const [handsWon, setHandsWon] = useState(0);
  const [handsLost, setHandsLost] = useState(0);
  const [handsDrawn, setHandsDrawn] = useState(0);
  const [profit, setProfit] = useState(0);
  const [infoTab, setInfoTab] = useState("home");
  const [correctMoves, setCorrectMoves] = useState(0);
  const [incorrectMoves, setIncorrectMoves] = useState(0);
  const [showOptimalMove, setShowOptimalMove] = useState(false);
  const [lastMoveCorrect, setLastMoveCorrect] = useState(null);
  /** Bumps on each new round so card keys remount for deal animations. */
  const [dealEpoch, setDealEpoch] = useState(0);

  const getOptimalMove = useCallback(
    (hand, dealerCard) => getOptimalMoveCore(hand, dealerCard, STRATEGY_OPTS),
    []
  );

  const resolveDealerTurn = useCallback(
    (overrides = {}) => {
      const ph = overrides.playerHands ?? playerHands;
      const newDeck = [...(overrides.deck ?? deck)];
      const newDealerHand = [...(overrides.dealerHand ?? dealerHand)];

      setRevealDealer(true);

      while (dealerShouldHit(newDealerHand, DEALER_HITS_SOFT17)) {
        newDealerHand.push(newDeck.pop());
      }

      setDeck(newDeck);
      setDealerHand(newDealerHand);

      const dealerScore = calculateHandValue(newDealerHand);

      let localHandsWon = 0;
      let localHandsLost = 0;
      let localHandsDrawn = 0;
      let localProfit = 0;

      ph.forEach((hand) => {
        const playerScore = calculateHandValue(hand);

        if (playerScore > 21) {
          localHandsLost++;
          localProfit -= 25;
        } else if (dealerScore > 21 || playerScore > dealerScore) {
          localHandsWon++;
          localProfit += 25;
        } else if (playerScore < dealerScore) {
          localHandsLost++;
          localProfit -= 25;
        } else {
          localHandsDrawn++;
        }
      });

      setHandsWon((prev) => prev + localHandsWon);
      setHandsLost((prev) => prev + localHandsLost);
      setHandsDrawn((prev) => prev + localHandsDrawn);
      setProfit((prev) => prev + localProfit);

      setGameOver(true);
    },
    [deck, dealerHand, playerHands]
  );

  const autoAdvanceToNextHand = useCallback(
    (ctx = {}) => {
      const hands = ctx.hands ?? playerHands;
      const deckOverride = ctx.deck;

      let newIndex = currentHandIndex + 1;
      while (
        newIndex < hands.length &&
        calculateHandValue(hands[newIndex]) === 21
      ) {
        newIndex++;
      }

      if (newIndex >= hands.length) {
        setGameOver(true);
        setPlayerTurn(false);
        setRevealDealer(true);
        resolveDealerTurn({
          playerHands: hands,
          ...(deckOverride !== undefined ? { deck: deckOverride } : {}),
        });
      } else {
        setCurrentHandIndex(newIndex);
      }
    },
    [currentHandIndex, playerHands, resolveDealerTurn]
  );

  const startGame = useCallback(() => {
    setDealEpoch((e) => e + 1);

    let newDeck = shuffleDeck(createDeck());

    const playerInitialHand = [newDeck.pop(), newDeck.pop()];
    const dealerInitialHand = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHands([playerInitialHand]);
    setCurrentHandIndex(0);
    setDealerHand(dealerInitialHand);
    setPlayerTurn(true);
    setGameOver(false);
    setMessage("");
    setRevealDealer(false);

    if (calculateHandValue(playerInitialHand) === 21) {
      setRevealDealer(true);
      setGameOver(true);
      setPlayerTurn(false);
      resolveDealerTurn({
        playerHands: [playerInitialHand],
        deck: newDeck,
        dealerHand: dealerInitialHand,
      });
    }
  }, [resolveDealerTurn]);

  const resetStats = useCallback(() => {
    setHandsWon(0);
    setHandsLost(0);
    setHandsDrawn(0);
    setProfit(0);
    setCorrectMoves(0);
    setIncorrectMoves(0);
  }, []);

  const hit = useCallback(() => {
    if (!playerTurn || gameOver) return;

    const newDeck = [...deck];
    const hands = [...playerHands];
    const hand = hands[currentHandIndex];
    const dealerCard = dealerHand[0];

    const optimalMove = getOptimalMove(hand, dealerCard);

    if (optimalMove === "H") {
      setCorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(true), 10);
    } else {
      setIncorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(false), 10);
    }

    const newCard = newDeck.pop();
    hand.push(newCard);

    setDeck(newDeck);
    setPlayerHands(hands);

    const handValue = calculateHandValue(hand);
    if (handValue >= 21) {
      autoAdvanceToNextHand({ hands, deck: newDeck });
    }
  }, [
    autoAdvanceToNextHand,
    currentHandIndex,
    deck,
    dealerHand,
    gameOver,
    getOptimalMove,
    playerHands,
    playerTurn,
  ]);

  const stand = useCallback(() => {
    if (!playerTurn || gameOver) return;

    const hands = [...playerHands];
    const hand = hands[currentHandIndex];
    const dealerCard = dealerHand[0];

    const optimalMove = getOptimalMove(hand, dealerCard);

    if (optimalMove === "S") {
      setCorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(true), 10);
    } else {
      setIncorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(false), 10);
    }

    let newIndex = currentHandIndex + 1;
    while (
      newIndex < hands.length &&
      calculateHandValue(hands[newIndex]) === 21
    ) {
      newIndex++;
    }

    if (newIndex >= hands.length) {
      setPlayerTurn(false);
      setRevealDealer(true);
      resolveDealerTurn({ playerHands: hands });
    } else {
      setCurrentHandIndex(newIndex);
    }
  }, [
    currentHandIndex,
    dealerHand,
    gameOver,
    getOptimalMove,
    playerHands,
    playerTurn,
    resolveDealerTurn,
  ]);

  const canSplit = useCallback(() => {
    const hand = playerHands[currentHandIndex];
    return (
      hand &&
      hand.length === 2 &&
      hand[0].value === hand[1].value &&
      playerHands.length < 4
    );
  }, [currentHandIndex, playerHands]);

  const canDoubleDown = useCallback(() => {
    const hand = playerHands[currentHandIndex];
    return hand && hand.length === 2;
  }, [currentHandIndex, playerHands]);

  const doubleDown = useCallback(() => {
    if (!canDoubleDown() || gameOver) return;

    const hands = [...playerHands];
    const hand = hands[currentHandIndex];
    const dealerCard = dealerHand[0];

    const optimalMove = getOptimalMove(hand, dealerCard);

    if (optimalMove === "D") {
      setCorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(true), 10);
    } else {
      setIncorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(false), 10);
    }

    const newDeck = [...deck];
    hand.push(newDeck.pop());
    setDeck(newDeck);
    setPlayerHands(hands);

    autoAdvanceToNextHand({ hands, deck: newDeck });
  }, [
    autoAdvanceToNextHand,
    canDoubleDown,
    currentHandIndex,
    deck,
    dealerHand,
    gameOver,
    getOptimalMove,
    playerHands,
  ]);

  const splitHand = useCallback(() => {
    if (!canSplit() || gameOver) return;

    const hands = [...playerHands];
    const hand = hands[currentHandIndex];
    const dealerCard = dealerHand[0];

    const optimalMove = getOptimalMove(hand, dealerCard);

    if (optimalMove === "P") {
      setCorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(true), 10);
    } else {
      setIncorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(false), 10);
    }

    const newDeck = [...deck];
    const newHand1 = [hand[0], newDeck.pop()];
    const newHand2 = [hand[1], newDeck.pop()];

    hands.splice(currentHandIndex, 1, newHand1, newHand2);
    setDeck(newDeck);
    setPlayerHands(hands);

    if (calculateHandValue(newHand1) === 21) {
      autoAdvanceToNextHand({ hands, deck: newDeck });
    }

    setTimeout(() => setLastMoveCorrect(null), 500);
  }, [
    autoAdvanceToNextHand,
    canSplit,
    currentHandIndex,
    deck,
    dealerHand,
    gameOver,
    getOptimalMove,
    playerHands,
  ]);

  const didAutoStart = useRef(false);
  useEffect(() => {
    if (didAutoStart.current) return;
    didAutoStart.current = true;
    startGame();
  }, [startGame]);

  return {
    dealEpoch,
    playerHands,
    dealerHand,
    currentHandIndex,
    playerTurn,
    gameOver,
    message,
    revealDealer,
    handsWon,
    handsLost,
    handsDrawn,
    profit,
    infoTab,
    setInfoTab,
    correctMoves,
    incorrectMoves,
    showOptimalMove,
    setShowOptimalMove,
    lastMoveCorrect,
    startGame,
    hit,
    stand,
    splitHand,
    doubleDown,
    getOptimalMove,
    resetStats,
    canSplit,
    canDoubleDown,
  };
}
