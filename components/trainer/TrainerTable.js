import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { calculateHandValue } from "@/lib/trainerUtils";
import { getSuitLetter } from "@/lib/trainerHelpers";
import AnimatedTableCard from "@/components/trainer/AnimatedTableCard";
import styles from "@/styles/Home.module.css";

function getHandOutcome(hand, dealerHand) {
  const playerScore = calculateHandValue(hand);
  const dealerScore = calculateHandValue(dealerHand);

  if (playerScore > 21) return "lose";
  if (dealerScore > 21 || playerScore > dealerScore) return "win";
  if (playerScore < dealerScore) return "lose";
  return "push";
}

const outcomeLabel = { win: "W", lose: "L", push: "P" };

const layoutEase = { duration: 0.22, ease: "easeInOut" };
const bubbleExit = { duration: 0.22, ease: "easeInOut" };

function HandScoreRow({ handScore, outcome, outcomeClass, dealEpoch, handIndex }) {
  return (
    <LayoutGroup id={`score-${dealEpoch}-${handIndex}`}>
      <motion.div className={styles.scoreRow}>
        <motion.div
          className={styles.scoreGroup}
          layout="position"
          transition={{ layout: layoutEase }}
        >
          <span className={styles.scoreChip}>{handScore}</span>
          <AnimatePresence>
            {outcome && (
              <motion.span
                key={`${dealEpoch}-${handIndex}-${outcome}`}
                className={`${styles.outcomeBubble} ${outcomeClass}`}
                aria-label={outcome}
                layout={false}
                initial={{ opacity: 0, scale: 0.55 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.55 }}
                transition={bubbleExit}
              >
                <span
                  className={
                    outcome === "win"
                      ? styles.outcomeBubbleLetterWin
                      : styles.outcomeBubbleLetter
                  }
                >
                  {outcomeLabel[outcome]}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}

export default function TrainerTable({
  dealEpoch,
  dealerHand,
  playerHands,
  currentHandIndex,
  playerTurn,
  gameOver,
  message,
  revealDealer,
  lastMoveCorrect,
  showOptimalMove,
  setShowOptimalMove,
  getOptimalMove,
  hit,
  stand,
  splitHand,
  doubleDown,
  canSplit,
  canDoubleDown,
  startGame,
}) {
  const dealerStagger = (index) => index * 0.09;
  const playerBaseDelay = Math.max(dealerHand.length, 2) * 0.09 + 0.16;
  const handCount = playerHands.length;
  const handsLayoutClass =
    handCount >= 4 ? styles.handsFour : handCount >= 2 ? styles.handsMany : "";

  const dealerScore = dealerHand.length
    ? revealDealer
      ? calculateHandValue(dealerHand)
      : calculateHandValue([dealerHand[0]])
    : null;

  const activeSuggestedMove =
    playerTurn && !gameOver && playerHands[currentHandIndex]
      ? getOptimalMove(playerHands[currentHandIndex], dealerHand[0])
      : "";

  return (
    <main
      className={`${styles.gameArea} ${
        lastMoveCorrect === true ? styles.correctFlash : ""
      } ${lastMoveCorrect === false ? styles.incorrectFlash : ""}`}
    >
      <div className={styles.table}>
        <div className={styles.tableBody}>
          <div className={styles.tableRow}>
            <div className={styles.rowHeader}>
              <h2>Dealer</h2>
              {dealerScore !== null && <span className={styles.scoreChip}>{dealerScore}</span>}
            </div>
            <div className={styles.cards}>
              {dealerHand.map((card, index) => {
                const isHole = index === 1;
                const faceSrc = `/cards/${card.value}${getSuitLetter(card.suit)}.png`;
                const backSrc = "/cards/back.png";
                const showingBack = isHole && !revealDealer;
                const src = showingBack ? backSrc : faceSrc;
                const alt = showingBack ? "Hidden Card" : `${card.value} of ${card.suit}`;

                if (isHole) {
                  const holeKey = revealDealer
                    ? `d-${dealEpoch}-hole-up`
                    : `d-${dealEpoch}-hole-down`;
                  return (
                    <AnimatedTableCard
                      key={holeKey}
                      src={src}
                      alt={alt}
                      className={styles.cardImage}
                      delay={dealerStagger(1)}
                      variant={revealDealer ? "flip" : "deal"}
                    />
                  );
                }

                return (
                  <AnimatedTableCard
                    key={`d-${dealEpoch}-${index}`}
                    src={src}
                    alt={alt}
                    className={styles.cardImage}
                    delay={dealerStagger(index)}
                    variant="deal"
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.tableDivider} aria-hidden="true" />

          <div className={styles.tableRow}>
            <div className={styles.rowHeader}>
              <h2>You</h2>
            </div>
            <div className={`${styles.handsContainer} ${handsLayoutClass}`}>
              {playerHands.map((hand, index) => {
                const outcome = gameOver ? getHandOutcome(hand, dealerHand) : null;
                const isActive = playerTurn && index === currentHandIndex && !gameOver;
                const handScore = calculateHandValue(hand);
                const outcomeClass = outcome
                  ? styles[`outcomeBubble${outcome.charAt(0).toUpperCase()}${outcome.slice(1)}`]
                  : "";

                return (
                  <div
                    key={index}
                    className={`${styles.hand} ${isActive ? styles.handActive : ""} ${
                      gameOver && !isActive && handCount > 1 ? styles.handInactive : ""
                    }`}
                  >
                    <HandScoreRow
                      handScore={handScore}
                      outcome={outcome}
                      outcomeClass={outcomeClass}
                      dealEpoch={dealEpoch}
                      handIndex={index}
                    />
                    <div className={styles.cards}>
                      {hand.map((card, cardIdx) => (
                        <AnimatedTableCard
                          key={`p-${dealEpoch}-${index}-${cardIdx}-${card.value}-${getSuitLetter(card.suit)}`}
                          src={`/cards/${card.value}${getSuitLetter(card.suit)}.png`}
                          alt={`${card.value} of ${card.suit}`}
                          className={styles.cardImage}
                          delay={playerBaseDelay + index * 0.12 + cardIdx * 0.09}
                          variant="deal"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {showOptimalMove && (
              <motion.p
                className={styles.suggestion}
                aria-live="polite"
                aria-hidden={!activeSuggestedMove}
                animate={{ opacity: activeSuggestedMove ? 1 : 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                {activeSuggestedMove ? `Optimal: ${activeSuggestedMove}` : "Optimal: —"}
              </motion.p>
            )}
          </div>
        </div>

        <div className={styles.tableActionBar}>
          <div className={styles.actionBarGroup}>
            {playerTurn && !gameOver ? (
              <>
                {canSplit() && (
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.splitButton}`}
                    onClick={splitHand}
                  >
                    Split
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.hitButton}`}
                  onClick={hit}
                >
                  Hit
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.standButton}`}
                  onClick={stand}
                >
                  Stand
                </button>
                {canDoubleDown() && (
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.doubleDownButton}`}
                    onClick={doubleDown}
                  >
                    Double
                  </button>
                )}
              </>
            ) : gameOver ? (
              <button
                type="button"
                className={`${styles.actionButton} ${styles.startButton}`}
                onClick={startGame}
              >
                Deal Again
              </button>
            ) : null}
          </div>
          <label className={styles.actionBarToggle}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={showOptimalMove}
              onChange={() => setShowOptimalMove((prev) => !prev)}
            />
            <span>Show optimal move</span>
          </label>
        </div>
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </main>
  );
}
