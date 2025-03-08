import React from "react";

const PlayerHand = ({
  hand,
  index,
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
  let handResult = "";
  let suggestedMove = "";
  let playerScore = calculateHandValue(hand);

  if (gameOver) {
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
    <div className={`hand ${index === currentHandIndex ? "activeHand" : ""}`}>
      {/* Playing indicator */}
      {index === currentHandIndex && playerTurn && <div className="playingTag">Playing</div>}

      <div className="handRow">
        {/* Score on the left */}
        <div className="handScore">Score: {playerScore}</div>

        {/* Cards */}
        <div className="cards">
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
              className="cardImage"
            />
          ))}
        </div>
      </div>

      {/* Hand Result (if game over) */}
      {gameOver && <p className="handResult">{handResult}</p>}

      {/* Suggested Move */}
      {playerTurn && index === currentHandIndex && showOptimalMove && (
        <p className="suggestion">Optimal Move: {suggestedMove}</p>
      )}
    </div>
  );
};

export default PlayerHand;
