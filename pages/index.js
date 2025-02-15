import { useState } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";

const suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const createDeck = () => {
  let deck = [];
  for (let i = 0; i < 4; i++) { // 4 decks
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
  }
  return deck;
};

const shuffleDeck = (deck) => deck.sort(() => Math.random() - 0.5);

const calculateHandValue = (hand = []) => {
  let total = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (!card || !card.value) return; // Prevent undefined access
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

const TabIcons = () => {
  return (
    <div className={styles.iconContainer}>
      <span className={styles.icon}>🎴</span> {}
      <span className={styles.icon}>♠️</span> {}
      <span className={styles.icon}>♣️</span> {}
      <span className={styles.icon}>♦️</span> {}
      <span className={styles.icon}>♥️</span> {}
    </div>
  );
};


export default function Home() {
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
  const [showOptimalMove, setShowOptimalMove] = useState(true);


  

  const startGame = () => {
    let newDeck = shuffleDeck(createDeck()); // Always reshuffle a new 4-deck shoe

    let playerInitialHand = [newDeck.pop(), newDeck.pop()];
    /*
    let fixedValue = "A"; // Change this value to test different splits
    let playerInitialHand = [
      { suit: suits[0], value: fixedValue },
      { suit: suits[1], value: fixedValue }
    ];*/

    let dealerInitialHand = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHands([playerInitialHand]);
    setCurrentHandIndex(0);
    setDealerHand(dealerInitialHand);
    setPlayerTurn(true);
    setGameOver(false);
    setMessage("");
    setRevealDealer(false);

    if (calculateHandValue(playerInitialHand) === 21) {
      setMessage("Blackjack! You win!");
      setRevealDealer(true);
      setGameOver(true);
      setPlayerTurn(false);
      resolveDealerTurn();
    }
  };

  const getOptimalMove = (hand, dealerCard) => {
    console.log("Hand:", hand);
    console.log("Dealer Card:", dealerCard);

    let dealerValue = dealerCard.value;

    // Convert face cards to 10
    let playerValues = hand.map(card =>
      ["J", "Q", "K", "10"].includes(card.value) ? "10" : card.value
    );

    console.log("Player Values:", playerValues);

    let numericValues = playerValues.map(val => val === "A" ? 1 : parseInt(val));

    let handTotal = numericValues.reduce((acc, card) => acc + card, 0);

    let hasAce = playerValues.includes("A");
    let isSoft = hasAce && handTotal + 10 <= 21; // True if Ace can safely be 11

    let isPair = numericValues.length === 2 &&
      (["10", "J", "Q", "K"].includes(playerValues[0]) &&
        ["10", "J", "Q", "K"].includes(playerValues[1]) ||
        playerValues[0] === playerValues[1]);

    let dealerNumericValue = ["J", "Q", "K", "10"].includes(dealerValue) ? 10 : (dealerValue === "A" ? 11 : parseInt(dealerValue));

    // **PAIR STRATEGY**
    if (isPair) {
      if (hasAce) return "P";  // Always split Aces

      const pairStrategy = {
        20: "S",
        18: dealerNumericValue === 7 || dealerNumericValue >= 10 ? "S" : "P",
        16: "P",
        14: dealerNumericValue >= 2 && dealerNumericValue <= 7 ? "P" : "H",
        12: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "P" : "H",
        10: dealerNumericValue >= 2 && dealerNumericValue <= 9 ? "D" : "H",
        8: "P",
        6: dealerNumericValue >= 2 && dealerNumericValue <= 7 ? "P" : "H",
        4: dealerNumericValue >= 5 && dealerNumericValue <= 6 ? "P" : "H",
      };
      return pairStrategy[handTotal] || "H";
    }

    // **SOFT HAND STRATEGY**
    if (isSoft) {
      let softTotal = handTotal + 10;  // Count Ace as 11
      console.log(`Soft Hand: A + ${handTotal - 1} | Soft Total: ${softTotal} | Dealer: ${dealerNumericValue}`);

      const softStrategy = {
        13: dealerNumericValue >= 5 && dealerNumericValue <= 6 ? "D" : "H",
        14: dealerNumericValue >= 5 && dealerNumericValue <= 6 ? "D" : "H",
        15: dealerNumericValue >= 4 && dealerNumericValue <= 6 ? "D" : "H",
        16: dealerNumericValue >= 4 && dealerNumericValue <= 6 ? "D" : "H",
        17: dealerNumericValue >= 3 && dealerNumericValue <= 6 ? "D" : "H",
        18: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "D" : (dealerNumericValue >= 7 && dealerNumericValue <= 8 ? "S" : "H"),
        19: dealerNumericValue === 6 ? "D" : "S",
        20: "S",
        21: "S"
      };
      return softStrategy[softTotal] || "H";
    }

    // **HARD HAND STRATEGY**
    const hardStrategy = {
      5: "H", 6: "H", 7: "H", 8: "H",
      9: dealerNumericValue >= 3 && dealerNumericValue <= 6 ? "D" : "H",
      10: dealerNumericValue >= 2 && dealerNumericValue <= 9 ? "D" : "H",
      11: "D",
      12: dealerNumericValue >= 4 && dealerNumericValue <= 6 ? "S" : "H",
      13: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "S" : "H",
      14: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "S" : "H",
      15: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "S" : "H",
      16: dealerNumericValue >= 2 && dealerNumericValue <= 6 ? "S" : "H",
      17: "S",
      18: "S", 19: "S", 20: "S", 21: "S"
    };
    return hardStrategy[handTotal] || "H";
  };



  const autoAdvanceToNextHand = () => {
    let hands = [...playerHands];
    let newIndex = currentHandIndex + 1;

    // Skip any hands that have 21
    while (newIndex < hands.length && calculateHandValue(hands[newIndex]) === 21) {
      newIndex++;
    }

    if (newIndex >= hands.length) {
      setMessage("All playable hands completed!");
      setGameOver(true);
      setPlayerTurn(false);
      setRevealDealer(true);
      resolveDealerTurn();
    } else {
      setCurrentHandIndex(newIndex);
    }
  };

  const resetStats = () => {
    setHandsWon(0);
    setHandsLost(0);
    setHandsDrawn(0);
    setProfit(0);
    setCorrectMoves(0);
    setIncorrectMoves(0);
  };


  const hit = () => {
    if (!playerTurn || gameOver) return;

    let newDeck = [...deck];
    let hands = [...playerHands];
    let hand = hands[currentHandIndex];
    let dealerCard = dealerHand[0];

    let optimalMove = getOptimalMove(hand, dealerCard);

    // Track correct or incorrect move
    if (optimalMove === "H") {
      setCorrectMoves(prev => prev + 1);
    } else {
      setIncorrectMoves(prev => prev + 1);
    }

    hand.push(newDeck.pop());
    setDeck(newDeck);
    setPlayerHands(hands);

    let handValue = calculateHandValue(hand);
    if (handValue >= 21) {
      autoAdvanceToNextHand();
    }
  };


  const stand = () => {
    if (!playerTurn || gameOver) return;

    let hands = [...playerHands];
    let hand = hands[currentHandIndex];
    let dealerCard = dealerHand[0];

    let optimalMove = getOptimalMove(hand, dealerCard);

    // Track correct or incorrect move
    if (optimalMove === "S") {
      setCorrectMoves(prev => prev + 1);
    } else {
      setIncorrectMoves(prev => prev + 1);
    }

    let newIndex = currentHandIndex + 1;
    while (newIndex < hands.length && calculateHandValue(hands[newIndex]) === 21) {
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



  const canSplit = () => {
    let hand = playerHands[currentHandIndex];
    return hand.length === 2 && hand[0].value === hand[1].value && playerHands.length < 4;
  };


  const canDoubleDown = () => {
    let hand = playerHands[currentHandIndex];
    return hand.length === 2; // Can only double down on first two cards
  };

  const doubleDown = () => {
    if (!canDoubleDown() || gameOver) return;

    let hands = [...playerHands];
    let hand = hands[currentHandIndex];
    let dealerCard = dealerHand[0];

    let optimalMove = getOptimalMove(hand, dealerCard);

    // Track correct or incorrect move
    if (optimalMove === "D") {
      setCorrectMoves(prev => prev + 1);
    } else {
      setIncorrectMoves(prev => prev + 1);
    }

    let newDeck = [...deck];
    hand.push(newDeck.pop());
    setDeck(newDeck);
    setPlayerHands(hands);

    autoAdvanceToNextHand();
  };




  const splitHand = () => {
    if (!canSplit() || gameOver) return;

    let hands = [...playerHands];
    let hand = hands[currentHandIndex];
    let dealerCard = dealerHand[0];

    let optimalMove = getOptimalMove(hand, dealerCard);

    // Track correct or incorrect move
    if (optimalMove === "P") {
      setCorrectMoves(prev => prev + 1);
    } else {
      setIncorrectMoves(prev => prev + 1);
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
  };



  const resolveDealerTurn = () => {
    let newDeck = [...deck];
    let newDealerHand = [...dealerHand];

    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }

    setDeck(newDeck);
    setDealerHand(newDealerHand);

    let dealerScore = calculateHandValue(newDealerHand);

    let localHandsWon = 0;
    let localHandsLost = 0;
    let localHandsDrawn = 0;
    let localProfit = 0; // Track session profit

    playerHands.forEach(hand => {
      let playerScore = calculateHandValue(hand);

      if (playerScore > 21) {
        localHandsLost++;
        localProfit -= 25; // Loss of $25 per lost hand
      } else if (dealerScore > 21 || playerScore > dealerScore) {
        localHandsWon++;
        localProfit += 25; // Win $25 per winning hand
      } else if (playerScore < dealerScore) {
        localHandsLost++;
        localProfit -= 25;
      } else {
        localHandsDrawn++; // No change for a push
      }
    });

    setHandsWon(prev => prev + localHandsWon);
    setHandsLost(prev => prev + localHandsLost);
    setHandsDrawn(prev => prev + localHandsDrawn);
    setProfit(prev => prev + localProfit);

    setGameOver(true);
  };




  return (
    <>
      <Head>
        <title>Blackjack Trainer</title>
      </Head>
      <div className={styles.container}>
        <main className={styles.gameArea}>
          <div className={styles.table}>
            <div className={styles.dealer}>
              <h2>Dealer</h2>
              <div className={styles.cards}>
                {dealerHand.map((card, index) => (
                  <span key={index}>{index === 0 || revealDealer ? `${card.value} ${card.suit}` : "❓"}</span>
                ))}
              </div>
              <p className={styles.dealerScore}>
                {revealDealer ? `Score: ${calculateHandValue(dealerHand)}` : ""}
              </p>
            </div>


            <div className={styles.player}>
              <h2>You</h2>
              <div className={`${styles.handsContainer} ${playerHands.length > 1 ? styles.multipleHands : ""}`}>
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
                    suggestedMove = getOptimalMove(hand, dealerHand[0]); // Get best move
                  }

                  return (
                    <div key={index} className={styles.hand}>
                      <h3>Hand {index + 1}</h3>
                      <div className={styles.cards}>
                        {hand.map((card, cardIndex) => (
                          <span key={cardIndex}>{card.value} {card.suit}</span>
                        ))}
                      </div>
                      <p>Score: {calculateHandValue(hand)}</p>

                      {/* Show Win / Lose / Push message only after game ends */}
                      {gameOver && <p className={styles.handResult}>{handResult}</p>}

                      {/* Show optimal move suggestion */}
                      {/* Show optimal move suggestion if enabled */}
{playerTurn && index === currentHandIndex && showOptimalMove && (
  <p className={styles.suggestion}>Optimal Move: {suggestedMove}</p>
)}

                      {/* Controls BELOW each respective hand */}
                      {index === currentHandIndex && !gameOver && playerTurn && (
                        <div className={styles.handControls}>
                          {canSplit() && (
                            <button className={`${styles.actionButton} ${styles.splitButton}`} onClick={splitHand}>P</button>
                          )}
                          <button className={`${styles.actionButton} ${styles.hitButton}`} onClick={hit}>H</button>
                          <button className={`${styles.actionButton} ${styles.standButton}`} onClick={stand}>S</button>
                          {canDoubleDown() && (
                            <button className={`${styles.actionButton} ${styles.doubleDownButton}`} onClick={doubleDown}>D</button>
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
        </main>

        {/* Information Pane */}
        <aside className={styles.infoPane}>
          <div className={styles.navLinks}>
            <button
              className={`${styles.navButton} ${infoTab === "home" ? styles.active : ""}`}
              onClick={() => setInfoTab("home")}
            >
              Home
            </button>
            <button
              className={`${styles.navButton} ${infoTab === "cheatsheet" ? styles.active : ""}`}
              onClick={() => setInfoTab("cheatsheet")}
            >
              Cheatsheet
            </button>
            <button
              className={`${styles.navButton} ${infoTab === "moreinfo" ? styles.active : ""}`}
              onClick={() => setInfoTab("moreinfo")}
            >
              More Info
            </button>
          </div>

          {/* Render content based on selected tab */}
          {infoTab === "home" ? (
            <>
              <h1 className={styles.title}>Blackjack Trainer</h1>
              <p>Played perfectly, the house only has a 0.23599%* edge on Blackjack, making it the most profitable game in a casino.</p>
              <p>This website is designed to help you master basic strategy.</p>
              <p>*Assuming the following: 4 decks, Dealer Stands on soft 17, Players can double on any cards, Players can split any cards, Players can resplit to 4 hands, cards are auto-shuffled, Blackjack pays 3 to 2, No surrender is offered.</p>
              <div className={styles.stats}>
                <p>Your Win %: {(handsWon + handsLost + handsDrawn > 0
                  ? ((handsWon / (handsWon + handsLost + handsDrawn)) * 100).toFixed(2)
                  : "0")}%</p>

                <p>Your W/L/D: {handsWon} - {handsLost} - {handsDrawn}</p>
                <p>$25 Hands, Your Profit: ${profit}</p>

                <p>Correct Moves: {correctMoves}</p>
                <p>Incorrect Moves: {incorrectMoves}</p>
                <p>Strategy Accuracy: {(correctMoves + incorrectMoves > 0
                  ? ((correctMoves / (correctMoves + incorrectMoves)) * 100).toFixed(2)
                  : "0")}%</p>

                {/* Reset Button */}
                <button className={styles.resetButton} onClick={resetStats}>
                  Reset Stats
                </button>
              </div>
              {/* Toggle Optimal Move Display */}
<div className={styles.toggleContainer}>
  <label className={styles.toggleLabel}>
    Show Optimal Move:
    <input
      type="checkbox"
      checked={showOptimalMove}
      onChange={() => setShowOptimalMove(prev => !prev)}
      className={styles.toggleInput}
    />
  </label>
</div>

              <TabIcons /> 


            </>
          ) : infoTab === "cheatsheet" ? (
            <>
              <h1 className={styles.title}>Blackjack Cheatsheet</h1>

              <h3>Hard Totals</h3>
              <table border="1">
                <tr>
                  <th>Your Hand</th>
                  <th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
                  <th>7</th><th>8</th><th>9</th><th>10</th><th>A</th>
                </tr>
                <tr><td>Hard 5</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Hard 6</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Hard 7</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Hard 8</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Hard 9</td><td>H</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Hard 10</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td></tr>
                <tr><td>Hard 11</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td></tr>
                <tr><td>Hard 12</td><td>H</td><td>H</td><td>S</td><td>S</td><td>S</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Hard 13+</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
              </table>

              <h3>Soft Totals</h3>
              <table border="1">
                <tr>
                  <th>Your Hand</th>
                  <th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
                  <th>7</th><th>8</th><th>9</th><th>10</th><th>A</th>
                </tr>
                <tr><td>Ace + 2</td><td>H</td><td>H</td><td>H</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Ace + 3</td><td>H</td><td>H</td><td>H</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Ace + 4</td><td>H</td><td>H</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Ace + 5</td><td>H</td><td>H</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Ace + 6</td><td>H</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>Ace + 7</td><td>DS</td><td>DS</td><td>DS</td><td>DS</td><td>DS</td><td>S</td><td>S</td><td>H</td><td>H</td><td>H</td></tr>
              </table>

              <h3>Pairs</h3>
              <table border="1">
                <tr>
                  <th>Your Hand</th>
                  <th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
                  <th>7</th><th>8</th><th>9</th><th>10</th><th>A</th>
                </tr>
                <tr><td>(2,2)</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>(3,3)</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>(4,4)</td><td>H</td><td>H</td><td>H</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>(5,5)</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td></tr>
                <tr><td>(6,6)</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>(7,7)</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                <tr><td>(8,8)</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td></tr>
                <tr><td>(9,9)</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>S</td><td>P</td><td>P</td><td>S</td><td>S</td></tr>
                <tr><td>(T,T)</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td></tr>
                <tr><td>(A,A)</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td></tr>
              </table>
              <TabIcons />
            </>
          ) : infoTab == "moreinfo" ? (
          <>
            <h1 className={styles.title}>More Info</h1>
            <TabIcons /> 
          </>
   ) : null}
        </aside>

      </div>
    </>
  );

}
