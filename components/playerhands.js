import React from "react";
import PlayerHand from "./playerhand.js";

const PlayerHands = ({
  playerHands,
  currentHandIndex,
  playerTurn,
  calculateHandValue,
  getSuitLetter,
  gameOver,
  dealerHand,
  getOptimalMove,
  playerCardRefs,
  showOptimalMove,
}) => {
  return (
    <div className="playerHandsContainer">
      <h2>You</h2>
      <div className="playerHandsInner">
        {playerHands.map((hand, index) => (
          <PlayerHand
            key={index}
            index={index}
            hand={hand}
            currentHandIndex={currentHandIndex}
            playerTurn={playerTurn}
            calculateHandValue={calculateHandValue}
            getSuitLetter={getSuitLetter}
            gameOver={gameOver}
            dealerHand={dealerHand}
            getOptimalMove={getOptimalMove}
            playerCardRefs={playerCardRefs}
            showOptimalMove={showOptimalMove}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerHands;
