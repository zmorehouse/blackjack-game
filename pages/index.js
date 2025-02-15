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

const calculateHandValue = (hand) => {
  let total = 0;
  let aces = 0;

  hand.forEach((card) => {
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



  const startGame = () => {
    let newDeck = shuffleDeck(createDeck()); // Always reshuffle a new 4-deck shoe

    //let playerInitialHand = [newDeck.pop(), newDeck.pop()];
    let fixedValue = "8"; // Change this value to test different splits
    let playerInitialHand = [
      { suit: suits[0], value: fixedValue },
      { suit: suits[1], value: fixedValue }
    ];

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



  const hit = () => {
    if (!playerTurn || gameOver) return;

    let newDeck = [...deck];
    let hands = [...playerHands];
    hands[currentHandIndex].push(newDeck.pop());
    setDeck(newDeck);
    setPlayerHands(hands);

    let handValue = calculateHandValue(hands[currentHandIndex]);

    if (handValue >= 21) {
      autoAdvanceToNextHand();
    }
  };


  const stand = () => {
    if (!playerTurn || gameOver) return;

    let hands = [...playerHands];
    let newIndex = currentHandIndex + 1;

    // Skip over hands that already have 21
    while (newIndex < hands.length && calculateHandValue(hands[newIndex]) === 21) {
      newIndex++;
    }

    if (newIndex >= hands.length) {
      // If all hands are done, resolve dealer turn
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

    let newDeck = [...deck];
    let hands = [...playerHands];

    // Add one card to the current hand
    hands[currentHandIndex].push(newDeck.pop());

    setDeck(newDeck);
    setPlayerHands(hands);

    // Move to next hand (if split), or resolve dealer's turn if this was last hand
    autoAdvanceToNextHand();
  };



  const splitHand = () => {
    if (!canSplit() || gameOver) return;

    let newDeck = [...deck];
    let hands = [...playerHands];
    let currentHand = hands[currentHandIndex];

    let newHand1 = [currentHand[0], newDeck.pop()];
    let newHand2 = [currentHand[1], newDeck.pop()];

    hands.splice(currentHandIndex, 1, newHand1, newHand2);
    setDeck(newDeck);
    setPlayerHands(hands);

    // Move to the next hand if the first one is 21
    let hand1Value = calculateHandValue(newHand1);
    if (hand1Value === 21) {
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
          <h1 className={styles.title}>Blackjack Trainer</h1>
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
    {playerHands.map((hand, index) => (
      <div key={index} className={styles.hand}>
        <h3>Hand {index + 1}</h3>
        <div className={styles.cards}>
          {hand.map((card, cardIndex) => (
            <span key={cardIndex}>{card.value} {card.suit}</span>
          ))}
        </div>
        <p>Score: {calculateHandValue(hand)}</p>

        {/* Controls BELOW each respective hand, only for the active hand */}
        {index === currentHandIndex && !gameOver && playerTurn && (
          <div className={styles.handControls}>
            {canSplit() && (
              <button className={`${styles.actionButton} ${styles.splitButton}`} onClick={splitHand}>Split</button>
            )}
            <button className={`${styles.actionButton} ${styles.hitButton}`} onClick={hit}>Hit</button>
            <button className={`${styles.actionButton} ${styles.standButton}`} onClick={stand}>Stand</button>
            {canDoubleDown() && (
              <button className={`${styles.actionButton} ${styles.doubleDownButton}`} onClick={doubleDown}>Double</button>
            )}
          </div>
        )}
      </div>
    ))}
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
          <h2>Game Information</h2>
          <p>Played perfectly, the house only has a 0.23599%* edge on Blackjack, making it the most profitable game in a casino.</p>
          <p>This website is designed to help you master basic strategy.</p>
          <p>*Assuming the following: 4 decks, Dealer Stands on soft 17, Players can double on any cards, Players can split any cards, Players can resplit to 4 hands, cards are auto-shuffled, Blackjack pays 3 to 2, No surrender is offered.</p>
          <div className={styles.stats}>
  <p>Your Win %: {(handsWon + handsLost + handsDrawn > 0 ? ((handsWon / (handsWon + handsLost + handsDrawn)) * 100).toFixed(2) : "0")}%</p>
  <p>Your W/L/D: {handsWon} - {handsLost} - {handsDrawn}</p>
  <p>$25 Hands, Your Profit: ${profit}</p>
</div>


        </aside>
      </div>
    </>
  );

}
