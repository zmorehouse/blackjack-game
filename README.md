# Dealers Dilemma

A browser-based blackjack basic strategy trainer. Practice optimal play at the table, get instant feedback on every decision, and track your accuracy over time.

**Live site:** [blackjack.zmorehouse.com](https://blackjack.zmorehouse.com)

## Overview

Blackjack has the lowest house edge of any casino game when played with correct basic strategy. Under the rules modeled in this trainer, that edge is **0.23599%**. Dealers Dilemma helps you internalize those decisions through repeated hands, visual feedback, and built-in reference charts.

The app deals automatically on load. Each hand presents the same choices you would have at a real table: hit, stand, double down, and split. After you act, the trainer compares your move against basic strategy and updates your session statistics.

## Features

- **Interactive table** with animated card dealing, dealer hole-card reveal, and win/loss/push indicators
- **Strategy feedback** on every player action, with optional display of the optimal move
- **Split-hand support** with horizontal scrolling for multiple active hands
- **Session statistics** including win rate, profit (at $25 per hand), correct/incorrect moves, and strategy accuracy
- **Cheatsheet tab** with hard, soft, and pair strategy charts plus hand-type explanations
- **More Info tab** with background on house edge, useful resources, and expandable reference sections
- **Responsive layout** for desktop and mobile

## Table Rules

The trainer assumes the following rules. Click the house edge figure on the Home tab in the app for the same list.

| Rule | Setting |
| --- | --- |
| Decks | 4 |
| Dealer on soft 17 | Stands |
| Double down | Any two cards |
| Splitting | Any pair |
| Resplit | Up to 4 hands |
| Shuffle | Automatic between rounds |
| Blackjack payout | 3:2 |
| Surrender | Not offered |
| Insurance | Never taken |

Strategy recommendations and the cheatsheet are aligned to these assumptions.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm

### Installation

```bash
git clone https://github.com/zmorehouse/blackjack-game.git
cd blackjack-game
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Project Structure

```
blackjack-game/
├── components/trainer/   # UI: table, sidebar, cheatsheet, animations
├── hooks/                # Game state and trainer logic (useBlackjackTrainer)
├── lib/                  # Pure helpers: deck, hand value, strategy lookup
├── pages/                # Next.js routes
├── public/               # Cards, images, static assets
└── styles/               # Global and module CSS
```

## Tech Stack

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- [Framer Motion](https://www.framer.com/motion/) for table and UI animations
- [GSAP](https://gsap.com/) for card motion
- ESLint (flat config)

## How Strategy Feedback Works

On each player action, the trainer evaluates your choice against basic strategy for the current hand and dealer upcard. Correct moves increment your accuracy count; incorrect moves are recorded separately from hand outcomes, so you can distinguish playing well from getting lucky.

Toggle **Show optimal move** under the table to reveal the recommended action for the active hand without making a decision first.

## Author

Built by [Zac Morehouse](https://zmorehouse.com).
