/* Blackjack Trainer By Zac 
 Please ignore the garbage code I'm still learning react! */

// Import Modules
import { useState, useLayoutEffect, useRef } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { gsap } from "gsap";

// Build our deck
const suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

const createDeck = () => {
  let deck = [];
  for (let i = 0; i < 4; i++) {
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
  }
  return deck;
};

const shuffleDeck = (deck) => deck.sort(() => Math.random() - 0.5);

const getSuitLetter = (suit) => {
  const suitMap = {
    "♠": "S",
    "♥": "H",
    "♦": "D",
    "♣": "C",
  };
  return suitMap[suit] || "S";
};

// Calculate values for use in optimal solution checker

const calculateHandValue = (hand = []) => {
  let total = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (!card || !card.value) return;
    if (card.value === "A") {
      aces += 1;
      total += 11;
    } else if (["J", "Q", "K"].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value);
    }
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
};

// Home Func
export default function Home() {
  // Init state vars
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
  const dealerCardRefs = useRef([]);
  const playerCardRefs = useRef([]);
  const animatedPlayerCards = useRef(new Set());
  const animatedDealerCards = useRef(new Set());
  const [flipCompleted, setFlipCompleted] = useState(false);

  // Function to start the game / replay the game
  const startGame = () => {
    let newDeck = shuffleDeck(createDeck());

    // Uncomment this to  test splits
    let playerInitialHand = [newDeck.pop(), newDeck.pop()];
    /* let fixedValue = "A"; 
    let playerInitialHand = [
      { suit: suits[0], value: fixedValue },
      { suit: suits[1], value: fixedValue }
    ]; */
    let dealerInitialHand = [newDeck.pop(), newDeck.pop()];

    animatedPlayerCards.current.clear();
    animatedDealerCards.current.clear();

    // Reset all vars for new game
    setDeck(newDeck);
    setPlayerHands([playerInitialHand]);
    setCurrentHandIndex(0);
    setDealerHand(dealerInitialHand);
    setPlayerTurn(true);
    setGameOver(false);
    setMessage("");
    setRevealDealer(false);

    // Instawin on Blackjack
    if (calculateHandValue(playerInitialHand) === 21) {
      setRevealDealer(true);
      setGameOver(true);
      setPlayerTurn(false);
      resolveDealerTurn();
    }
  };

  // Function to get the optmial move
  const getOptimalMove = (hand, dealerCard) => {
    let dealerValue = dealerCard.value;
    let playerValues = hand.map((card) =>
      ["J", "Q", "K", "10"].includes(card.value) ? "10" : card.value
    );

    let numericValues = playerValues.map((val) =>
      val === "A" ? 1 : parseInt(val)
    );
    let handTotal = numericValues.reduce((acc, card) => acc + card, 0);
    let hasAce = playerValues.includes("A");
    let isSoft = hasAce && handTotal + 10 <= 21;

    let isPair =
      numericValues.length === 2 &&
      ((["10", "J", "Q", "K"].includes(playerValues[0]) &&
        ["10", "J", "Q", "K"].includes(playerValues[1])) ||
        playerValues[0] === playerValues[1]);

    let dealerNumericValue = ["J", "Q", "K", "10"].includes(dealerValue)
      ? 10
      : dealerValue === "A"
      ? 11
      : parseInt(dealerValue);
    const canDouble = hand.length === 2;

    // Return optimal move for pairs
    if (isPair) {
      if (hasAce) return "P";
      const pairStrategy = {
        20: "S",
        18: dealerNumericValue === 7 || dealerNumericValue >= 10 ? "S" : "P",
        16: "P",
        14: dealerNumericValue >= 2 && dealerNumericValue <= 7 ? "P" : "H",
        12: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "P" : "H",
        10: canDouble
          ? dealerNumericValue >= 2 && dealerNumericValue <= 9
            ? "D"
            : "H"
          : "H",
        8: "P",
        6: dealerNumericValue >= 2 && dealerNumericValue <= 7 ? "P" : "H",
        4: dealerNumericValue >= 5 && dealerNumericValue <= 6 ? "P" : "H",
      };
      return pairStrategy[handTotal] || "H";
    }

    // Return optimal move for soft hands
    if (isSoft) {
      let softTotal = handTotal + 10;
      const softStrategy = {
        13:
          canDouble && dealerNumericValue >= 5 && dealerNumericValue <= 6
            ? "D"
            : "H",
        14:
          canDouble && dealerNumericValue >= 5 && dealerNumericValue <= 6
            ? "D"
            : "H",
        15:
          canDouble && dealerNumericValue >= 4 && dealerNumericValue <= 6
            ? "D"
            : "H",
        16:
          canDouble && dealerNumericValue >= 4 && dealerNumericValue <= 6
            ? "D"
            : "H",
        17:
          canDouble && dealerNumericValue >= 3 && dealerNumericValue <= 6
            ? "D"
            : "H",
        18:
          canDouble && dealerNumericValue >= 2 && dealerNumericValue <= 6
            ? "D"
            : dealerNumericValue >= 7 && dealerNumericValue <= 8
            ? "S"
            : "H",
        19: canDouble && dealerNumericValue === 6 ? "D" : "S",
        20: "S",
        21: "S",
      };
      return softStrategy[softTotal] || "H";
    }

    // If not pair or soft, must be hard hand. Return optimal move for hard hand
    const hardStrategy = {
      5: "H",
      6: "H",
      7: "H",
      8: "H",
      9:
        canDouble && dealerNumericValue >= 3 && dealerNumericValue <= 6
          ? "D"
          : "H",
      10:
        canDouble && dealerNumericValue >= 2 && dealerNumericValue <= 9
          ? "D"
          : "H",
      11: canDouble ? "D" : "H",
      12: dealerNumericValue >= 4 && dealerNumericValue <= 6 ? "S" : "H",
      13: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "S" : "H",
      14: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "S" : "H",
      15: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "S" : "H",
      16: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "S" : "H",
      17: "S",
      18: "S",
      19: "S",
      20: "S",
      21: "S",
    };
    return hardStrategy[handTotal] || "H";
  };

  // Function to skip hands if they bust or hit 21
  const autoAdvanceToNextHand = () => {
    let hands = [...playerHands];
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
      resolveDealerTurn();
    } else {
      setCurrentHandIndex(newIndex);
    }
  };

  // Function to reset stats on sidebar
  const resetStats = () => {
    setHandsWon(0);
    setHandsLost(0);
    setHandsDrawn(0);
    setProfit(0);
    setCorrectMoves(0);
    setIncorrectMoves(0);
  };

  // Hit function
  const hit = () => {
    if (!playerTurn || gameOver) return;

    let newDeck = [...deck];
    let hands = [...playerHands];
    let hand = hands[currentHandIndex];

    let dealerCard = dealerHand[0];

    let optimalMove = getOptimalMove(hand, dealerCard);

    if (optimalMove === "H") {
      setCorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(true), 10);
    } else {
      setIncorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(false), 10);
    }

    // Store new card
    let newCard = newDeck.pop();
    hand.push(newCard);

    setDeck(newDeck);
    setPlayerHands(hands);

    let newCardIndex = hand.length - 1;

    let handValue = calculateHandValue(hand);
    if (handValue >= 21) {
      autoAdvanceToNextHand();
    }
  };

  // Stand function
  const stand = () => {
    if (!playerTurn || gameOver) return;

    let hands = [...playerHands];
    let hand = hands[currentHandIndex];
    let dealerCard = dealerHand[0];

    let optimalMove = getOptimalMove(hand, dealerCard);

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
      resolveDealerTurn();
    } else {
      setCurrentHandIndex(newIndex);
    }
  };

  // Check if the player is allowed to split
  const canSplit = () => {
    let hand = playerHands[currentHandIndex];
    return (
      hand.length === 2 &&
      hand[0].value === hand[1].value &&
      playerHands.length < 4
    );
  };

  // Check if the player is allowed to double down
  const canDoubleDown = () => {
    let hand = playerHands[currentHandIndex];
    return hand.length === 2;
  };

  // Double Down function
  const doubleDown = () => {
    if (!canDoubleDown() || gameOver) return;

    let hands = [...playerHands];
    let hand = hands[currentHandIndex];
    let dealerCard = dealerHand[0];

    let optimalMove = getOptimalMove(hand, dealerCard);

    if (optimalMove === "D") {
      setCorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(true), 10);
    } else {
      setIncorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(false), 10);
    }

    let newDeck = [...deck];
    hand.push(newDeck.pop());
    setDeck(newDeck);
    setPlayerHands(hands);

    autoAdvanceToNextHand();
  };

  // Split Hand Function
  const splitHand = () => {
    if (!canSplit() || gameOver) return;

    let hands = [...playerHands];
    let hand = hands[currentHandIndex];
    let dealerCard = dealerHand[0];

    let optimalMove = getOptimalMove(hand, dealerCard);

    if (optimalMove === "P") {
      setCorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(true), 10);
    } else {
      setIncorrectMoves((prev) => prev + 1);
      setLastMoveCorrect(null);
      setTimeout(() => setLastMoveCorrect(false), 10);
    }

    let newDeck = [...deck];
    let newHand1 = [hand[0], newDeck.pop()];
    let newHand2 = [hand[1], newDeck.pop()];

    hands.splice(currentHandIndex, 1, newHand1, newHand2);
    setDeck(newDeck);
    setPlayerHands(hands);

    if (calculateHandValue(newHand1) === 21) {
      autoAdvanceToNextHand();
    }

    setTimeout(() => setLastMoveCorrect(null), 500);
  };

  // Function to resolve dealer turn (run after everything else is sorted)
  const resolveDealerTurn = () => {
    let newDeck = [...deck];
    let newDealerHand = [...dealerHand];

    setRevealDealer(true);

    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }

    setDeck(newDeck);
    setDealerHand(newDealerHand);

    let dealerScore = calculateHandValue(newDealerHand);

    let localHandsWon = 0;
    let localHandsLost = 0;
    let localHandsDrawn = 0;
    let localProfit = 0;

    playerHands.forEach((hand) => {
      let playerScore = calculateHandValue(hand);

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

    // Add to Statistics
    setHandsWon((prev) => prev + localHandsWon);
    setHandsLost((prev) => prev + localHandsLost);
    setHandsDrawn((prev) => prev + localHandsDrawn);
    setProfit((prev) => prev + localProfit);

    setGameOver(true);
  };

  // Web Page
  return (
    <>
      <Head>
        <title>Optimal Strategy Blackjack Trainer</title>
        <meta
          name="description"
          content="Master the game of blackjack with our Optimal Strategy Blackjack Trainer. Learn perfect blackjack strategy, practice decision-making, and improve your gameplay for free."
        />
        <meta
          name="keywords"
          content="blackjack trainer, optimal blackjack strategy, blackjack game, strategy trainer, card game, blackjack practice, blackjack strategy chart, free blackjack trainer"
        />
        <meta name="author" content="Zac Morehouse" />
        <meta name="robots" content="index, follow" />

        <meta
          property="og:title"
          content="Optimal Strategy Blackjack Trainer"
        />
        <meta
          property="og:description"
          content="Enhance your blackjack skills with our Optimal Strategy Blackjack Trainer. Train with the best strategy and improve your chances of winning."
        />
        <meta property="og:url" content="https://blackjack.zmorehouse.com/" />
        <meta property="og:type" content="website" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://blackjack.zmorehouse.com/" />

        <link rel="preload" as="image" href="/cards/2S.png" />
        <link rel="preload" as="image" href="/cards/2C.png" />
        <link rel="preload" as="image" href="/cards/2H.png" />
        <link rel="preload" as="image" href="/cards/2D.png" />
        <link rel="preload" as="image" href="/cards/3S.png" />
        <link rel="preload" as="image" href="/cards/3C.png" />
        <link rel="preload" as="image" href="/cards/3H.png" />
        <link rel="preload" as="image" href="/cards/3D.png" />
        <link rel="preload" as="image" href="/cards/4S.png" />
        <link rel="preload" as="image" href="/cards/4C.png" />
        <link rel="preload" as="image" href="/cards/4H.png" />
        <link rel="preload" as="image" href="/cards/4D.png" />
        <link rel="preload" as="image" href="/cards/5S.png" />
        <link rel="preload" as="image" href="/cards/5C.png" />
        <link rel="preload" as="image" href="/cards/5H.png" />
        <link rel="preload" as="image" href="/cards/5D.png" />
        <link rel="preload" as="image" href="/cards/6S.png" />
        <link rel="preload" as="image" href="/cards/6C.png" />
        <link rel="preload" as="image" href="/cards/6H.png" />
        <link rel="preload" as="image" href="/cards/6D.png" />
        <link rel="preload" as="image" href="/cards/7S.png" />
        <link rel="preload" as="image" href="/cards/7C.png" />
        <link rel="preload" as="image" href="/cards/7H.png" />
        <link rel="preload" as="image" href="/cards/7D.png" />
        <link rel="preload" as="image" href="/cards/8S.png" />
        <link rel="preload" as="image" href="/cards/8C.png" />
        <link rel="preload" as="image" href="/cards/8H.png" />
        <link rel="preload" as="image" href="/cards/8D.png" />
        <link rel="preload" as="image" href="/cards/9S.png" />
        <link rel="preload" as="image" href="/cards/9C.png" />
        <link rel="preload" as="image" href="/cards/9H.png" />
        <link rel="preload" as="image" href="/cards/9D.png" />
        <link rel="preload" as="image" href="/cards/10S.png" />
        <link rel="preload" as="image" href="/cards/10C.png" />
        <link rel="preload" as="image" href="/cards/10H.png" />
        <link rel="preload" as="image" href="/cards/10D.png" />
        <link rel="preload" as="image" href="/cards/JS.png" />
        <link rel="preload" as="image" href="/cards/JC.png" />
        <link rel="preload" as="image" href="/cards/JH.png" />
        <link rel="preload" as="image" href="/cards/JD.png" />
        <link rel="preload" as="image" href="/cards/QS.png" />
        <link rel="preload" as="image" href="/cards/QC.png" />
        <link rel="preload" as="image" href="/cards/QH.png" />
        <link rel="preload" as="image" href="/cards/QD.png" />
        <link rel="preload" as="image" href="/cards/KS.png" />
        <link rel="preload" as="image" href="/cards/KC.png" />
        <link rel="preload" as="image" href="/cards/KH.png" />
        <link rel="preload" as="image" href="/cards/KD.png" />
        <link rel="preload" as="image" href="/cards/AS.png" />
        <link rel="preload" as="image" href="/cards/AC.png" />
        <link rel="preload" as="image" href="/cards/AH.png" />
        <link rel="preload" as="image" href="/cards/AD.png" />
      </Head>
      {/* Game Area */}
      <div className={styles.container}>
        <main
          className={`${styles.gameArea} ${
            lastMoveCorrect === true ? styles.correctFlash : ""
          } ${lastMoveCorrect === false ? styles.incorrectFlash : ""}`}
        >
          <div className={styles.table}>
            <div className={styles.dealer}>
              <h2>Dealer</h2>

              <div className={styles.cards}>
                {dealerHand.map((card, index) => (
                  <div key={index} className="cardContainer">
                    <img
                      ref={(el) => (dealerCardRefs.current[index] = el)}
                      src={
                        index === 1 && !revealDealer
                          ? `/cards/back.png`
                          : `/cards/${card.value}${getSuitLetter(
                              card.suit
                            )}.png`
                      }
                      alt={
                        index === 1 && !revealDealer
                          ? "Hidden Card"
                          : `${card.value} of ${card.suit}`
                      }
                      className={`${styles.cardImage} ${
                        index === 1 && !revealDealer ? styles.hiddenCard : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
              {playerHands.length > 0 && (
                <p className={styles.dealerScore}>
                  Score:{" "}
                  {revealDealer
                    ? calculateHandValue(dealerHand)
                    : calculateHandValue([dealerHand[0]])}
                </p>
              )}
            </div>

            <div className={styles.player}>
              <h2>You</h2>
              <div
                className={`${styles.handsContainer} ${
                  playerHands.length > 1 ? styles.multipleHands : ""
                }`}
              >
                {playerHands.map((hand, index) => {
                  let handResult = "";
                  let suggestedMove = "";

                  if (gameOver) {
                    let playerScore = calculateHandValue(hand);
                    let dealerScore = calculateHandValue(dealerHand);

                    if (playerScore > 21) {
                      handResult = "Lose";
                    } else if (dealerScore > 21 || playerScore > dealerScore) {
                      handResult = "Win";
                    } else if (playerScore < dealerScore) {
                      handResult = "Lose";
                    } else {
                      handResult = "Push";
                    }
                  } else if (playerTurn && index === currentHandIndex) {
                    suggestedMove = getOptimalMove(hand, dealerHand[0]);
                  }

                  return (
                    <div key={index} className={styles.hand}>
                      <h3>Hand {index + 1}</h3>
                      <div className={styles.cards}>
                        {hand.map((card, cardIdx) => (
                          <img
                            key={cardIdx}
                            ref={(el) => {
                              if (!playerCardRefs.current[index]) {
                                playerCardRefs.current[index] = [];
                              }
                              playerCardRefs.current[index][cardIdx] = el;
                            }}
                            src={`/cards/${card.value}${getSuitLetter(
                              card.suit
                            )}.png`}
                            alt={`${card.value} of ${card.suit}`}
                            className={styles.cardImage}
                          />
                        ))}
                      </div>
                      <p>Score: {calculateHandValue(hand)}</p>

                      {gameOver && (
                        <p className={styles.handResult}>{handResult}</p>
                      )}

                      {playerTurn &&
                        index === currentHandIndex &&
                        showOptimalMove && (
                          <p className={styles.suggestion}>
                            Optimal Move: {suggestedMove}
                          </p>
                        )}

                      {index === currentHandIndex &&
                        !gameOver &&
                        playerTurn && (
                          <div className={styles.handControls}>
                            {canSplit() && (
                              <button
                                className={`${styles.actionButton} ${styles.splitButton}`}
                                onClick={splitHand}
                              >
                                Split
                              </button>
                            )}
                            <button
                              className={`${styles.actionButton} ${styles.hitButton}`}
                              onClick={hit}
                            >
                              Hit
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.standButton}`}
                              onClick={stand}
                            >
                              Stand
                            </button>
                            {canDoubleDown() && (
                              <button
                                className={`${styles.actionButton} ${styles.doubleDownButton}`}
                                onClick={doubleDown}
                              >
                                Double
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {!playerTurn && (
            <button
              className={`${styles.actionButton} ${styles.startButton}`}
              onClick={startGame}
            >
              {gameOver ? "Play Again" : "Start Game"}
            </button>
          )}

          {message && <p className={styles.message}>{message}</p>}
          <p className={styles.poweredby}>
            {" "}
            A{" "}
            <a href="https://zmorehouse.com" target="_blank">
              {" "}
              zmorehouse.com
            </a>{" "}
            project
          </p>
        </main>

        {/* Information Pane */}
        <aside className={styles.infoPane}>
          <div className={styles.navLinks}>
            <button
              className={`${styles.navButton} ${
                infoTab === "home" ? styles.active : ""
              }`}
              onClick={() => setInfoTab("home")}
            >
              Home
            </button>
            <button
              className={`${styles.navButton} ${
                infoTab === "cheatsheet" ? styles.active : ""
              }`}
              onClick={() => setInfoTab("cheatsheet")}
            >
              Cheatsheet
            </button>
            <button
              className={`${styles.navButton} ${
                infoTab === "moreinfo" ? styles.active : ""
              }`}
              onClick={() => setInfoTab("moreinfo")}
            >
              More Info
            </button>
          </div>

          {/* Home Tab */}
          {infoTab === "home" ? (
            <>
              <h1 className={styles.title}> Zac's Blackjack Trainer</h1>
              <div className={styles.tooltipContainer}>
                <p>
                  Played perfectly, the house only has
                  <span className={styles.tooltipTrigger}> 0.23599%*</span> edge
                  on Blackjack, making it the most profitable game in a casino.
                </p>
                <p className={styles.subheader}>
                  This website is designed to help you master basic blackjack
                  strategy.
                </p>

                <div className={styles.tooltipContent}>
                  Assuming the following :
                  <ul>
                    <li>4 decks are used</li>
                    <li>Dealer stands on soft 17</li>
                    <li>Players can double on any cards</li>
                    <li>Players can split any cards</li>
                    <li>Players can resplit to 4 hands</li>
                    <li>Cards are auto-shuffled</li>
                    <li>Blackjack pays 3 to 2</li>
                    <li>No surrender is offered</li>
                    <li>Insurance is never taken</li>
                  </ul>
                </div>
              </div>

              <div className={styles.stats}>
                <h2 className={styles.statsTitle}>
                  <span>Your Statistics</span>
                </h2>

                <div className={styles.statRow}>
                  <span>Your Win %</span>
                  <span>
                    {handsWon + handsLost + handsDrawn > 0
                      ? (
                          (handsWon / (handsWon + handsLost + handsDrawn)) *
                          100
                        ).toFixed(2)
                      : "0"}
                    %
                  </span>
                </div>

                <div className={styles.statRow}>
                  <span>Your W/L/D</span>
                  <span>
                    {handsWon} - {handsLost} - {handsDrawn}
                  </span>
                </div>

                <div className={styles.statRow}>
                  <span>$25 Hands, Your Profit</span>
                  <span>${profit}</span>
                </div>

                <div className={styles.statRow}>
                  <span>Correct Moves </span>
                  <span>{correctMoves}</span>
                </div>

                <div className={styles.statRow}>
                  <span>Incorrect Moves</span>
                  <span>{incorrectMoves}</span>
                </div>

                <div className={styles.statRow}>
                  <span>Strategy Accuracy</span>
                  <span>
                    {correctMoves + incorrectMoves > 0
                      ? (
                          (correctMoves / (correctMoves + incorrectMoves)) *
                          100
                        ).toFixed(2)
                      : "0"}
                    %
                  </span>
                </div>

                <div className={styles.divider}></div>
                <div className={styles.toggleResetContainer}>
                  <button className={styles.resetButton} onClick={resetStats}>
                    Reset Stats
                  </button>

                  <label className={styles.toggleLabel}>
                    Show Optimal Move:
                    <input
                      type="checkbox"
                      checked={showOptimalMove}
                      onChange={() => setShowOptimalMove((prev) => !prev)}
                      className={styles.toggleInput}
                    />
                  </label>
                </div>
                <div className={styles.divider}></div>
              </div>
              <div className={styles.footerdiv}>
                <p>
                  {" "}
                  Win big? Slide a chip my way and{" "}
                  <a href="https://buymeacoffee.com/zmorehouse" target="_blank">
                    {" "}
                    shout me a coffee
                  </a>{" "}
                  ☕{" "}
                </p>
              </div>
            </>
          ) : infoTab === "cheatsheet" ? (
            <>
              {/* Cheatsheet */}

              <h2 className={styles.title}>Blackjack Cheatsheet</h2>
              <div className={styles.cheatsheets}>
                <p> A 'hard' hand is one where an Ace is equal to 11.</p>
                <p> A soft hand has an Ace that can act as either 11 or 1</p>
                <p> All tens are considered equals (K/Q/J/10).</p>
                <p className={styles.finalline}>
                  {" "}
                  H = Hit, D = Double Down, DS = Double Down or Stand, P = Split
                </p>
                <h3>Hard Totals</h3>
                <table border="1">
                  <tr>
                    <th>Your Hand</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                    <th>5</th>
                    <th>6</th>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th>10</th>
                    <th>A</th>
                  </tr>
                  <tr>
                    <td>Hard 5 - 8</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Hard 9</td>
                    <td>H</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Hard 10</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Hard 11</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                  </tr>
                  <tr>
                    <td>Hard 12</td>
                    <td>H</td>
                    <td>H</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Hard 13 - 16</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Hard 17 - 21</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                  </tr>
                </table>

                <h3>Soft Totals</h3>
                <table border="1">
                  <tr>
                    <th>Your Hand</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                    <th>5</th>
                    <th>6</th>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th>10</th>
                    <th>A</th>
                  </tr>
                  <tr>
                    <td>Ace + 2</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>D</td>
                    <td>D</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Ace + 3</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>D</td>
                    <td>D</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Ace + 4</td>
                    <td>H</td>
                    <td>H</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Ace + 5</td>
                    <td>H</td>
                    <td>H</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Ace + 6</td>
                    <td>H</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Ace + 7</td>
                    <td>DS</td>
                    <td>DS</td>
                    <td>DS</td>
                    <td>DS</td>
                    <td>DS</td>
                    <td>S</td>
                    <td>S</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>Ace + 8</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>DS</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                  </tr>
                  <tr>
                    <td>Ace + 9</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                  </tr>
                </table>

                <h3>Pairs</h3>
                <table border="1">
                  <tr>
                    <th>Your Hand</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                    <th>5</th>
                    <th>6</th>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th>10</th>
                    <th>A</th>
                  </tr>
                  <tr>
                    <td>(2,2)</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>(3,3)</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>(4,4)</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>P</td>
                    <td>P</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>(5,5)</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>D</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>(6,6)</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>(7,7)</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                    <td>H</td>
                  </tr>
                  <tr>
                    <td>(8,8)</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                  </tr>
                  <tr>
                    <td>(9,9)</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>S</td>
                    <td>P</td>
                    <td>P</td>
                    <td>S</td>
                    <td>S</td>
                  </tr>
                  <tr>
                    <td>(T,T)</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                    <td>S</td>
                  </tr>
                  <tr>
                    <td>(A,A)</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                    <td>P</td>
                  </tr>
                </table>
              </div>
            </>
          ) : infoTab == "moreinfo" ? (
            <>
              {/* More Info Tab */}

              <h2 className={styles.title}>More Info</h2>
              <p className={styles.resourcesCopy}>
                Blackjack is the most profitable game in the casino when played
                correctly. With optimal strategy, you can reduce the house edge
                to 0.23599%—making it the best bet on the floor.
              </p>

              <h2 className={styles.statsTitle}>
                <span>How The House Profits</span>
              </h2>
              <p className={styles.resourcesCopyList}>
                Even so, theres plenty of ways the casino's look to screw you :{" "}
              </p>
              <p className={styles.resourcesCopyList}>
                Offering / Taking Insurance <br /> Insurance is never
                worthwhile, don't get suckered into it!{" "}
              </p>
              <p className={styles.resourcesCopyList}>
                Offering Side Bets <br /> (Think betting on pairs, betting on
                dealer blackjack, etc.)
              </p>
              <p className={styles.resourcesCopyList}>
                6:5 Blackjack <br /> Some casinos payout 6:5 instead of 3:2.
                House edge jumps nearly 1.4%{" "}
              </p>
              <p className={styles.resourcesCopyList}>
                Dealer Hits on Soft 17 <br /> A small rule but one that
                fundamentally changes basic strategy.
              </p>
              <p className={styles.resourcesCopyList}>
                Blackjack Plus (Australia) <br /> For the Aussies out there.
                Avoid Blackjack Plus at Star & Crown. The dealer pushes on 22
                which throws basic strategy out the window.
              </p>
              <h2 className={styles.statsTitle}>
                <span>Some Useful Resources</span>
              </h2>
              <a
                className={styles.resources}
                href="https://www.blackjackapprenticeship.com/blackjack-calculator/"
                target="_blank"
              >
                House Edge Calculator
              </a>
              <a
                className={styles.resources}
                href="https://www.theplaidhorse.com/2025/01/23/how-to-spot-and-avoid-unfavorable-blackjack-tables/"
                target="_blank"
              >
                Avoiding Dodgy Tables
              </a>
              <a
                className={styles.resources}
                href="https://wizardofodds.com/gambling/house-edge/"
                target="_blank"
              >
                House Edge of ALL Casino Games
              </a>
              <a
                className={styles.resources}
                href="https://www.shs-conferences.org/articles/shsconf/pdf/2022/18/shsconf_icprss2022_03038.pdf"
                target="_blank"
              >
                Additional Sources
              </a>
            </>
          ) : null}
        </aside>
      </div>
    </>
  );
}
