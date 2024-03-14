// import chalk from 'chalk';
import type { Card, Foundations } from "./types/types"
import { SUIT, RANK, errors } from "./constants"
import { yellow } from "chalk";

const createCard = (rank: RANK, suit: SUIT, isVisible: boolean) => {
  const newCard: Card = {
    rank,
    suit,
    isVisible,
  };
  return newCard;
};

/*
  * Suits & Ranks *
*/

const isBlack = ({ suit }: Card) => suit === SUIT.CLUB || suit === SUIT.SPADE;

const isRed = ({ suit }: Card) => suit === SUIT.HEART || suit === SUIT.DIAMOND;

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

const prepareToDisplayCard = ({ rank, suit }: Card) => {
  let displayReadyCard = ""
  if (rank + 1 === 1) {
    displayReadyCard += 'A';
  } else if (rank + 1 === 11) {
    displayReadyCard += 'J';
  } else if (rank + 1 === 12) {
    displayReadyCard += 'Q';
  } else if (rank + 1 === 13) {
    displayReadyCard += 'K';
  } else {
    displayReadyCard += `${rank + 1}`;
  }

  if (suit === SUIT.CLUB) {
    displayReadyCard += '♣';
  } else if (suit === SUIT.DIAMOND) {
    displayReadyCard += '♦';
  } else if (suit === SUIT.HEART) {
    displayReadyCard += '♥';
  } else {
    displayReadyCard += '♠';
  }

  return displayReadyCard;
};

const generateDeck = () => {
  const deck = ([] as Card[]);

  for(let rank = 0; rank < RANK.RANK_COUNT; rank++) {
    for (let suit = 0; suit < SUIT.SUIT_COUNT; suit++) {
      deck.push(createCard(rank, suit, false));
    }
  }

  return deck;
}

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

/*
  moves a card from the top of the stockpile
  to the top of the waste (beginning of array)
*/
const fromStockpileToWaste = (stockpile: Card[], waste: Card[]) => {
  waste.unshift(stockpile.shift());
  waste[0].isVisible = true;
};

/*
  Reverses the waste and moves it into the stockpile,
  then empties the waste.
*/
const refillStockpile = (stockpile: Card[], waste: Card[]) => {
  if (stockpile.length === 0 && waste.length !== 0) {
    stockpile = waste.reverse();
    stockpile = stockpile.map((card: Card) => {card.isVisible = false; return card; })
    waste = ([] as Card[]);
  }
  return { stockpile, waste };
};

const moveFromWasteToFoundation = (waste: Card[], foundations: Foundations) => {
  try {
    /* if the waste is empty, throw a warning and return the params as-is */
    if (waste.length === 0) {
      throw errors.invalidMove;
    }
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
      /* if it's not an Ace, look for the foundation that matches it's suit and check if it's sequential. if it is, add it to the top of the foundation (beginning of the array) */
      for (const index in foundations) {
        if (foundations[index].length > 0 &&
            isSameSuit(foundations[index][0], waste[0]) &&
            isInSequence(foundations[index][0], waste[0])) {
          foundations[index].unshift(waste.shift());
          break;
        }
      }
    }

    /* if card at the top of the waste pile is the same as it was before that means this was not valid to move, so throw a warning */
    if (cardToMove === waste[0]) {
      throw errors.invalidMove;
    }

  } catch (error) {
    console.warn(yellow(error.message));
  }
  return { waste, foundations };
};

const moveFromWasteToPile = (waste: Card[], pile: Card[]) => {
  try {
    /* if the waste is empty, throw a warning and return the params as-is */
    if (waste.length === 0) {
      throw errors.invalidMove;
    }
    /* save the first card in the waste to compare at the end */
    const cardToMove = waste[0];

    /* if the pile is empty or the card at the top
    of the waste is the card at the top of the pile
    alternate colors and are sequential, move the
    card Waste -> Pile */
    if (pile.length === 0 ||
        (isInSequence(waste[0], pile[0]) &&
        isAlternateColor(waste[0], pile[0]))) {
      pile.push(waste.shift());
    }

    /* if card at the top of the waste pile is the
    same as it was before that means this was not
    valid to move, so throw a warning */
    if (cardToMove === waste[0]) {
      throw errors.invalidMove;
    }

  } catch (error) {
    console.warn(yellow(error.message));
  }
  return { waste, pile };
}

export {
  createCard,
  isBlack,
  isRed,
  isSameSuit,
  isAlternateColor,
  isInSequence,
  canBePlacedOnBottom,
  canBePlacedOnFoundation,
  prepareToDisplayCard,
  generateDeck,
  shuffleDeck,
  fromStockpileToWaste,
  refillStockpile,
  moveFromWasteToFoundation,
  moveFromWasteToPile,
}