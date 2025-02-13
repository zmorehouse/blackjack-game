import { useState } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Create and shuffle a deck
const createDeck = () => {
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

// Calculate hand value
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
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);
  const [betPlaced, setBetPlaced] = useState(false);

  const startGame = () => {
    if (bet <= 0 || bet > balance) {
      setMessage("Invalid bet. Please enter a valid amount.");
      return;
    }

    let newDeck = createDeck();
    let playerInitialHand = [newDeck.pop(), newDeck.pop()];
    let dealerInitialHand = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHand(playerInitialHand);
    setDealerHand(dealerInitialHand);
    setPlayerTurn(true);
    setGameOver(false);
    setMessage("");
    setBalance((prevBalance) => prevBalance - bet);
    setBetPlaced(true);

    if (calculateHandValue(playerInitialHand) === 21) {
      setMessage("Blackjack! You win!");
      setBalance((prevBalance) => prevBalance + bet * 2.5);
      setGameOver(true);
      setPlayerTurn(false);
    }
  };

  const hit = () => {
    if (!playerTurn || gameOver) return;

    let newDeck = [...deck];
    let newPlayerHand = [...playerHand, newDeck.pop()];

    setDeck(newDeck);
    setPlayerHand(newPlayerHand);

    let playerScore = calculateHandValue(newPlayerHand);

    if (playerScore === 21) {
      setMessage("Blackjack! You win!");
      setBalance((prevBalance) => prevBalance + bet * 2);
      setGameOver(true);
      setPlayerTurn(false);
    } else if (playerScore > 21) {
      setMessage("Bust! You lose.");
      setGameOver(true);
      setPlayerTurn(false);
    }
  };

  const stand = () => {
    if (!playerTurn || gameOver) return;

    setPlayerTurn(false);

    let newDeck = [...deck];
    let newDealerHand = [...dealerHand];

    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }

    setDeck(newDeck);
    setDealerHand(newDealerHand);

    let playerScore = calculateHandValue(playerHand);
    let dealerScore = calculateHandValue(newDealerHand);

    if (dealerScore > 21 || playerScore > dealerScore) {
      setMessage("You win!");
      setBalance((prevBalance) => prevBalance + bet * 2);
    } else if (playerScore < dealerScore) {
      setMessage("Dealer wins!");
    } else {
      setMessage("It's a tie!");
      setBalance((prevBalance) => prevBalance + bet);
    }

    setGameOver(true);
  };

  return (
    <>
      <Head>
        <title>Blackjack Game</title>
        <meta name="description" content="Play a fun game of blackjack online!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.page}>
        <main className={styles.main}>
          <h1 className={styles.title}>Blackjack</h1>
          <p className={styles.subtitle}>Try your luck against the dealer!</p>

          {/* Display Player Balance */}
          <p className={styles.balance}>Balance: ${balance}</p>

          {/* Betting Input */}
          {!betPlaced && (
            <div className={styles.betContainer}>
              <input
                type="number"
                className={styles.betInput}
                placeholder="Enter bet amount"
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
              />
              <button className={styles.betButton} onClick={startGame}>
                Place Bet & Start
              </button>
            </div>
          )}

          {/* Dealer Section */}
          <div className={styles.table}>
            <div className={styles.dealer}>
              <h2>Dealer</h2>
              <div className={styles.cards}>
                {dealerHand.map((card, index) => (
                  <span key={index}>
                    {card.value} {card.suit}
                  </span>
                ))}
              </div>
              <p>Score: {calculateHandValue(dealerHand)}</p>
            </div>

            {/* Player Section */}
            <div className={styles.player}>
              <h2>You</h2>
              <div className={styles.cards}>
                {playerHand.map((card, index) => (
                  <span key={index}>
                    {card.value} {card.suit}
                  </span>
                ))}
              </div>
              <p>Score: {calculateHandValue(playerHand)}</p>
            </div>
          </div>

          {/* Game Controls */}
          <div className={styles.controls}>
            {betPlaced && !gameOver ? (
              <>
                <button className={styles.hitButton} onClick={hit}>
                  Hit
                </button>
                <button className={styles.standButton} onClick={stand}>
                  Stand
                </button>
              </>
            ) : (
              gameOver && (
                <button
                  className={styles.startButton}
                  onClick={() => {
                    setBet(0);
                    setBetPlaced(false);
                    setGameOver(false);
                    setMessage("");
                  }}
                >
                  Play Again
                </button>
              )
            )}
          </div>

          {/* Display Game Message */}
          {message && <p className={styles.message}>{message}</p>}
        </main>
      </div>
    </>
  );
}
