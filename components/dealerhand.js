import React from "react";

const DealerHand = ({ dealerHand, revealDealer, dealerCardRefs, playerHands, calculateHandValue, getSuitLetter }) => {
  return (
    <div className="dealerHand">
      <h2>Dealer</h2>
      <div className="dealerInner">
        {/* Dealer Score */}
        {playerHands.length > 0 && (
          <p className="dealerScore">
            {revealDealer
              ? calculateHandValue(dealerHand)
              : calculateHandValue([dealerHand[0]])}
          </p>
        )}

        {/* Dealer Cards */}
        <div className="dealerCards">
          <div className="cards">
            {dealerHand.map((card, index) => (
              <div key={index} className="cardContainer">
                <img
                  ref={(el) => (dealerCardRefs.current[index] = el)}
                  src={
                    index === 1 && !revealDealer
                      ? `/cards/back.png`
                      : `/cards/${card.value}${getSuitLetter(card.suit)}.png`
                  }
                  alt={
                    index === 1 && !revealDealer
                      ? "Hidden Card"
                      : `${card.value} of ${card.suit}`
                  }
                  className={`cardImage ${index === 1 && !revealDealer ? "hiddenCard" : ""}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerHand;
