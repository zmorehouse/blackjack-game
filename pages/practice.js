import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import Head from "next/head";
import styles from "@/styles/Home.module.css";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";

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

const TabPane = ({ visible, title, onClose, content }) => (
  <div className={`sideWindowPane ${visible ? "active" : ""}`}>
    <div className="closeButton" onClick={onClose}>
      X
    </div>
    <h2>{title}</h2>
    <div>{content}</div>
  </div>
);

const SideTab = ({ title, active, onClick }) => (
  <div className={`sideTab ${active ? "active" : ""}`} onClick={onClick}>
    <p>{title}</p>
  </div>
);

const Practice = () => {
  // Game Logic
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

    // let playerInitialHand = [newDeck.pop(), newDeck.pop()];
     let fixedValue = "A"; 
    let playerInitialHand = [
      { suit: suits[0], value: fixedValue },
      { suit: suits[1], value: fixedValue }
    ]; 
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

  // Side panel logic
  const [activeTab, setActiveTab] = useState(null);

  const tabs = [
    {
      title: "Help",
      content: "Here is some helpful information about the game...",
    },
    {
      title: "Cheatsheet",
      content: "Here is the cheatsheet with some tips and strategies...",
    },
    { title: "Stats", content: "stats" },
  ];

  const handleTabClick = (index) => {
    setActiveTab(activeTab === index ? null : index); // Toggle the visibility of the active tab
  };

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <>
      <Head>
        {/* Preload Links */}
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

      <div className="blackjackPageContainer">
        {/* Website Logo at the Top Left */}
        <div className="blackjackLogo">
          <p>Logo</p>
        </div>


        <div className="blackjackBoard">
          {/* Dealer's Hand Section */}
          <div className="dealerHand">
            <h2>Dealer</h2>
            <div className="dealerInner">
              <p className="dealerTotal">
              {playerHands.length > 0 && (
                  <p className={styles.dealerScore}>
                    {" "}
                    {revealDealer
                      ? calculateHandValue(dealerHand)
                      : calculateHandValue([dealerHand[0]])}
                  </p>
                )}
              </p>


              <div className="dealerCards">

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

              </div>
            </div>
          </div>

          {/* Centered Stats Section */}
          <div className="statsContainer">
            <div className="correctStats">
              <p>Correct Hands: 10/20</p> {/* Update with the actual stats */}
            </div>
            <div className="latestHands">
              {[...Array(5)].map((_, index) => (
                <div className="handStats" key={index}>
                  <p>Hand {index + 1}</p>
                  <p>Status: Correct</p>
                </div>
              ))}
            </div>
            <div className="winPercentage">
              <p>Current Win %: 50%</p> {/* Update with the actual win % */}
            </div>
          </div>

{/* Player Hands Section */}
<div className="playerHandsContainer">
 
    <h2>You</h2>
          <div className="playerHandsInner">

       
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
          <div
            key={index}
            className={`${styles.hand} ${
              index === currentHandIndex ? styles.activeHand : ""
            }`}
          >
            
            {/* Playing indicator */}
            {index === currentHandIndex && playerTurn && (
              <div className={styles.playingTag}>Playing</div>
            )}
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
                  src={`/cards/${card.value}${getSuitLetter(card.suit)}.png`}
                  alt={`${card.value} of ${card.suit}`}
                  className={styles.cardImage}
                />
              ))}
            </div>

            {gameOver && <p className={styles.handResult}>{handResult}</p>}

            {playerTurn && index === currentHandIndex && showOptimalMove && (
              <p className={styles.suggestion}>Optimal Move: {suggestedMove}</p>
            )}
          </div>
        );
      })}

</div>
</div>

{/* Action Buttons at the Bottom */}
<div className="actionButtons">
  {playerTurn && !gameOver && (
    <>
      {canSplit() && (
        <button
          className={`${styles.actionButton} ${styles.splitButton}`}
          onClick={splitHand}
        >
          Split
        </button>
      )}
      <button className={`${styles.actionButton} ${styles.hitButton}`} onClick={hit}>
        Hit
      </button>
      <button className={`${styles.actionButton} ${styles.standButton}`} onClick={stand}>
        Stand
      </button>

        <button
          className={`${styles.actionButton} ${styles.doubleButton}`}
          onClick={doubleDown}
        >
          Double
        </button>

    </>
  )}
  
        {/* Play button */}
        {!playerTurn && (
            <button
              className={`${styles.actionButton} ${styles.startButton}`}
              onClick={startGame}
            >
              {gameOver ? "Play Again" : "Start Game"}
            </button>
          )}

        </div>
      </div>
</div>


        

      {/* Right Side Tabs */}
      <div className="sideTabs">
        {tabs.map((tab, index) => (
          <SideTab
            key={index}
            title={tab.title}
            active={activeTab === index}
            onClick={() => handleTabClick(index)}
          />
        ))}
      </div>

      {/* Tab Panes */}
      {tabs.map((tab, index) => (
        <TabPane
          key={index}
          visible={activeTab === index}
          title={tab.title}
          onClose={() => handleTabClick(index)}
          content={tab.content}
        />
      ))}
    </>
  );
};

export default Practice;
