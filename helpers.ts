// import chalk from 'chalk';
import type { Card } from "./types"
import { SUIT, RANK} from "./constants"

// const paintCard = (card: Card) => {
//   if (card.includes('♥') || card.includes('♦')) {
//     return chalk.red(card);
//   } else {
//     return chalk.blackBright(card);
//   }
// }

const createCard = (rank: RANK, suit: SUIT) => {
  const newCard: Card = {
    rank,
    suit
  };
  return newCard;
};

/*
  * Suits & Ranks *
*/

const isBlack = (card: Card) => card.suit === SUIT.CLUB || card.suit === SUIT.SPADE;

const isRed = (card: Card) => card.suit === SUIT.HEART || card.suit === SUIT.DIAMOND;

const isSameSuit = (first: Card, second: Card) => first.suit === second.suit;

const isAlternateColor = (first: Card, second: Card) => (
  isBlack(first) !== isBlack(second)
);

const isInSequence = (lower: Card, higher: Card) => (
  higher.rank === lower.rank + 1
);

const canBePlacedOnBottom = (parent: Card, child: Card) => (
  isAlternateColor(parent, child) && isInSequence(child, parent)
);

const canBePlacedOnFoundation = (parent: Card, child: Card) => (
  isInSequence(child, parent) && isSameSuit(parent, child)
);

/*
  * The Deck *
*/

const shuffleDeck = (deck: Card[]) => {
  let curr = deck.length;
  let randomIndex = 0;
  const rearrangedDeck = deck.slice();

  //while there's still cards to shuffle
  while (curr > 0) {
    //pick a remaining card
    randomIndex = Math.floor(Math.random() * curr);
    curr--;
    //swap with current card
    [rearrangedDeck[curr], rearrangedDeck[randomIndex]] = [rearrangedDeck[randomIndex], rearrangedDeck[curr]];
  }

  return rearrangedDeck;
};

const fromStockpileToWaste = (stockpile: Card[], waste: Card[]) => {
  waste.push(stockpile.shift());
  return { stockpile, waste };
};

export =  {
  // paintCard,
  createCard,
  isBlack,
  isRed,
  isSameSuit,
  isAlternateColor,
  isInSequence,
  canBePlacedOnBottom,
  canBePlacedOnFoundation,
  shuffleDeck,
  fromStockpileToWaste,
}