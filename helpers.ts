// import chalk from 'chalk';
import type { Card, Foundations } from "./types"
import { SUIT, RANK } from "./constants"

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

const prepareToDisplayCard = (card: Card) => {
  let displayReadyCard = ""
  if (card.rank + 1 === 1) {
    displayReadyCard += 'A';
  } else if (card.rank + 1 === 11) {
    displayReadyCard += 'J';
  } else if (card.rank + 1 === 12) {
    displayReadyCard += 'Q';
  } else if (card.rank + 1 === 13) {
    displayReadyCard += 'K';
  } else {
    displayReadyCard += `${card.rank + 1}`;
  }

  if (card.suit === SUIT.CLUB) {
    displayReadyCard += '♣';
  } else if (card.suit === SUIT.DIAMOND) {
    displayReadyCard += '♦';
  } else if (card.suit === SUIT.HEART) {
    displayReadyCard += '♥';
  } else {
    displayReadyCard += '♠';
  }

  return displayReadyCard;
};

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

/*
  * Stockpile & Waste *
*/

const fromStockpileToWaste = (stockpile: Card[], waste: Card[]) => {
  waste.unshift(stockpile.shift());
};

const refillStockpile = (stockpile: Card[], waste: Card[]) => {
  if (stockpile.length === 0 && waste.length !== 0) {
    stockpile = waste.reverse();
    waste = ([] as Card[]);
  }
  return { stockpile, waste };
};

const moveFromWasteToFoundation = (waste: Card[], foundations: Foundations) => {
  /* save the first card in the waste to compare at the end */
  const cardToMove = waste[0];

  /* if the card is an Ace, look for the first empty foudnation to put it in */
  if (waste[0].rank === RANK.RANK_A) {
    for (const index in foundations) {
      if (foundations[index].length === 0) {
        foundations[index].push(waste.shift());
        break;
      }
    }
  } else {
    /* if it's not an Ace, look for the pile that matches it's suit and check if it's sequential. if it is, add it to the top of the foundation (beginning of the array) */
    for (const index in foundations) {
      if (foundations[index].length > 0 &&
          isSameSuit(foundations[index][0], waste[0]) &&
          isInSequence(foundations[index][0], waste[0])) {
        foundations[index].unshift(waste.shift());
        break;
      }
    }
  }

  /* if card at the top of the waste pile is the same as it was before that means the card was not valid to move, so send a warning */
  if (cardToMove === waste[0]) {
    console.warn('That was not a valid move.');
  }

  return { waste, foundations };
};

export = {
  createCard,
  isBlack,
  isRed,
  isSameSuit,
  isAlternateColor,
  isInSequence,
  canBePlacedOnBottom,
  canBePlacedOnFoundation,
  prepareToDisplayCard,
  shuffleDeck,
  fromStockpileToWaste,
  refillStockpile,
  moveFromWasteToFoundation,
}