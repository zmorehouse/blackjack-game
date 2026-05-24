/** Pure helpers shared by the trainer hook and UI. */

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

export const createDeck = () => {
  const deck = [];
  for (let i = 0; i < 4; i++) {
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
  }
  return deck;
};

export const getSuitLetter = (suit) => {
  const suitMap = {
    "♠": "S",
    "♥": "H",
    "♦": "D",
    "♣": "C",
  };
  return suitMap[suit] || "S";
};

export const moveLabel = (move) => {
  switch (move) {
    case "H":
      return "Hit";
    case "S":
      return "Stand";
    case "D":
      return "Double";
    case "P":
      return "Split";
    case "R":
      return "Surrender";
    default:
      return move || "";
  }
};

export const dealerUpcardLabel = (card) => {
  if (!card) return "";
  if (card.value === "A") return "A";
  if (["J", "Q", "K"].includes(card.value)) return "10";
  return card.value;
};

export const getHandShape = (hand = []) => {
  const playerValues = hand
    .filter(Boolean)
    .map((card) => (["J", "Q", "K", "10"].includes(card.value) ? "10" : card.value));

  const numericValues = playerValues.map((val) => (val === "A" ? 1 : parseInt(val, 10)));
  const handTotal = numericValues.reduce((acc, card) => acc + card, 0);
  const hasAce = playerValues.includes("A");
  const isSoft = hasAce && handTotal + 10 <= 21;

  const isPair =
    numericValues.length === 2 &&
    ((["10", "J", "Q", "K"].includes(playerValues[0]) &&
      ["10", "J", "Q", "K"].includes(playerValues[1])) ||
      playerValues[0] === playerValues[1]);

  return { playerValues, numericValues, handTotal, hasAce, isSoft, isPair };
};

export const handSummaryText = (hand) =>
  (hand || [])
    .map((c) => c?.value)
    .filter(Boolean)
    .join(", ");

/**
 * @param {Function} getOptimalMove - (hand, dealerCard) => string
 */
export const buildMoveExplanation = (hand, dealerCard, rules, playerHandsCount, getOptimalMove) => {
  const shape = getHandShape(hand);

  const dealerValue = dealerCard?.value;
  const dealerNumericValue = ["J", "Q", "K", "10"].includes(dealerValue)
    ? 10
    : dealerValue === "A"
    ? 11
    : parseInt(dealerValue || "0", 10);

  const canDouble = (hand?.length || 0) === 2;
  const canSplitNow =
    (hand?.length || 0) === 2 &&
    hand?.[0]?.value &&
    hand?.[1]?.value &&
    hand[0].value === hand[1].value;

  const optimal = getOptimalMove(hand, dealerCard);
  const kind = shape.isPair ? "Pair" : shape.isSoft ? "Soft" : "Hard";

  const playerLabel = shape.isPair
    ? `(${shape.playerValues[0]}, ${shape.playerValues[1]})`
    : shape.isSoft
    ? `Soft ${shape.handTotal + 10}`
    : `Hard ${shape.handTotal}`;

  const explanationBits = [];
  explanationBits.push(`${kind} hand vs dealer ${dealerUpcardLabel(dealerCard)}.`);

  if (shape.isPair && !canSplitNow) {
    explanationBits.push("Splitting only applies to your first two cards.");
  }
  if (optimal === "D" && !canDouble) {
    explanationBits.push("Doubling is only allowed on the first two cards here.");
  }
  if (optimal === "R" && rules.allowSurrender) {
    explanationBits.push(
      "Late surrender lets you forfeit half the bet instead of playing a bad total vs a strong dealer card."
    );
  }

  if (shape.isSoft) {
    explanationBits.push(
      "Soft hands can absorb a hit (Ace can drop from 11 to 1), so they play more aggressively."
    );
  } else if (!shape.isPair) {
    explanationBits.push(
      "Hard totals can’t safely absorb many hits; you lean on dealer bust chances on weak upcards (4–6)."
    );
  } else {
    explanationBits.push(
      "Pairs are special: splitting can improve EV by turning one weak hand into two stronger starting hands."
    );
  }

  const notes = [];
  if (optimal === "P" && !canSplitNow) {
    notes.push("Split is only available when your first two cards match.");
  }
  if (optimal === "D" && !canDouble) {
    notes.push("Double is only available with exactly two cards.");
  }
  if (optimal === "P" && playerHandsCount >= 4) {
    notes.push("Max hands reached (4).");
  }
  if (optimal === "R" && playerHandsCount > 1) {
    notes.push("Surrender is only offered before splitting (first hand only).");
  }
  if (optimal === "R" && !rules.allowSurrender) {
    notes.push("Turn on surrender in Options to practice Rs.");
  }

  const move = moveLabel(optimal);
  const symbols = { H: "H", S: "S", D: "D", P: "P", R: "R" };

  return {
    optimal,
    title: "Why this is correct",
    subtitle: `${playerLabel} vs dealer ${dealerUpcardLabel(dealerCard)}`,
    move,
    symbol: symbols[optimal] || optimal,
    canDouble,
    canSplitNow,
    dealerNumericValue,
    explanation: explanationBits.join(" "),
    notes,
  };
};
