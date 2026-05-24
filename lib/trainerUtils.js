/** Pure helpers for the blackjack trainer (Fisher–Yates, dealer rules, surrender subset). */

export const shuffleDeck = (deck) => {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const calculateHandValue = (hand = []) => {
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
      total += parseInt(card.value, 10);
    }
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
};

/** True if hand is soft (Ace counted as 11 without busting). */
export const isSoftHand = (hand = []) => {
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
      total += parseInt(card.value, 10);
    }
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return aces > 0 && total <= 21;
};

export const dealerShouldHit = (hand, dealerHitsSoft17) => {
  const v = calculateHandValue(hand);
  if (v < 17) return true;
  if (v > 17) return false;
  if (!dealerHitsSoft17) return false;
  return isSoftHand(hand);
};

const dealerNumeric = (dealerValue) => {
  if (["J", "Q", "K", "10"].includes(dealerValue)) return 10;
  if (dealerValue === "A") return 11;
  return parseInt(dealerValue, 10);
};

/**
 * Late surrender (LS) subset for 4–8 deck S17, DAS, no RSA — common trainer assumptions.
 * Only first two cards; pair 8,8 is handled by pair strategy (split), not surrender here.
 */
export const lateSurrenderMove = (hand, dealerCard) => {
  if (!hand || hand.length !== 2 || !dealerCard) return null;
  const dv = dealerNumeric(dealerCard.value);
  const vals = hand.map((c) =>
    ["J", "Q", "K", "10"].includes(c.value) ? "10" : c.value
  );
  const nums = vals.map((v) => (v === "A" ? 1 : parseInt(v, 10)));
  const sum = nums.reduce((a, b) => a + b, 0);
  const hasAce = vals.includes("A");
  const isSoft = hasAce && sum + 10 <= 21;
  const isPair =
    nums.length === 2 &&
    ((["10", "J", "Q", "K"].includes(vals[0]) && ["10", "J", "Q", "K"].includes(vals[1])) ||
      vals[0] === vals[1]);

  if (isPair) return null;

  if (isSoft) return null;

  const hard = sum;
  if (hard === 15 && dv === 10) return "R";
  if (hard === 16 && (dv === 9 || dv === 10 || dv === 11)) return "R";
  return null;
};

/** Same chart as in-page trainer; extend with surrender when allowed. */
export const getOptimalMove = (hand, dealerCard, options = {}) => {
  const { allowSurrender = false } = options;

  if (allowSurrender && hand.length === 2) {
    const sur = lateSurrenderMove(hand, dealerCard);
    if (sur === "R") return "R";
  }

  const dealerValue = dealerCard.value;
  const playerValues = hand.map((card) =>
    ["J", "Q", "K", "10"].includes(card.value) ? "10" : card.value
  );
  const numericValues = playerValues.map((val) => (val === "A" ? 1 : parseInt(val, 10)));
  const handTotal = numericValues.reduce((acc, card) => acc + card, 0);
  const hasAce = playerValues.includes("A");
  const isSoft = hasAce && handTotal + 10 <= 21;
  const isPair =
    numericValues.length === 2 &&
    ((["10", "J", "Q", "K"].includes(playerValues[0]) &&
      ["10", "J", "Q", "K"].includes(playerValues[1])) ||
      playerValues[0] === playerValues[1]);

  const dealerNumericValue = dealerNumeric(dealerValue);
  const canDouble = hand.length === 2;

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

  if (isSoft) {
    const softTotal = handTotal + 10;
    const softStrategy = {
      13:
        canDouble && dealerNumericValue >= 5 && dealerNumericValue <= 6 ? "D" : "H",
      14:
        canDouble && dealerNumericValue >= 5 && dealerNumericValue <= 6 ? "D" : "H",
      15:
        canDouble && dealerNumericValue >= 4 && dealerNumericValue <= 6 ? "D" : "H",
      16:
        canDouble && dealerNumericValue >= 4 && dealerNumericValue <= 6 ? "D" : "H",
      17:
        canDouble && dealerNumericValue >= 3 && dealerNumericValue <= 6 ? "D" : "H",
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

  const hardStrategy = {
    5: "H",
    6: "H",
    7: "H",
    8: "H",
    9:
      canDouble && dealerNumericValue >= 3 && dealerNumericValue <= 6 ? "D" : "H",
    10:
      canDouble && dealerNumericValue >= 2 && dealerNumericValue <= 9 ? "D" : "H",
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
