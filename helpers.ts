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
  const cardToMove = waste[0];
  if (waste[0].rank === RANK.RANK_A) {
    for (const index in foundations) {
      if (foundations[index].length === 0) {
        foundations[index].push(waste.shift());
        break;
      }
    }
  } else {
    for (const index in foundations) {
      const foundationSize = foundations[index].length;
      if (isSameSuit(foundations[index][0], waste[0]) &&
          isInSequence(foundations[index][foundationSize - 1], waste[0])) {
        foundations[index].push(waste.shift());
        break;
      }
    }
  }

  if (cardToMove === waste[0]) {
    console.log('That was not a valid move. Please try again.');
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