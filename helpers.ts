import { red, dim } from 'chalk';
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
import { SUIT, RANK, errors } from "./constants"
import { yellow } from "chalk";
import {
  Card,
  Foundations,
  GameState
} from "./types/types"

/*
  * User Input *
*/
const rl = readline.createInterface({
  input,
  output,
});

const question = (answer: string) => new Promise(resolve => rl.question(answer, resolve));


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

const getNumVisible = (pile: Card[]) => {
  return pile.filter((card) => card.isVisible === true).length;
}

/*
  * The Deck *
*/

const prepareToDisplayCard = (card: Card | undefined) => {
  let displayReadyCard = ""

  if (!card) {
    return displayReadyCard;
  }

  if (!card.isVisible) {
    return "[]";
  }
  switch (card.rank) {
    case RANK.RANK_A: {
      displayReadyCard += 'A';
      break;
    }
    case RANK.RANK_J: {
      displayReadyCard += 'J';
      break;
    }
    case RANK.RANK_Q: {
      displayReadyCard += 'Q';
      break;
    }
    case RANK.RANK_K: {
      displayReadyCard += 'K';
      break;
    }
    default: {
      displayReadyCard += `${card.rank + 1}`
    }
  }

  switch (card.suit) {
    case SUIT.CLUB: {
      displayReadyCard += '♣';
      break;
    }
    case SUIT.DIAMOND: {
      displayReadyCard += '♦';
      break;
    }
    case SUIT.HEART: {
      displayReadyCard += '♥';
      break;
    }
    default: {
      displayReadyCard += '♠';
      break;
    }
  }

  return isRed(card) ? red(displayReadyCard) : dim(displayReadyCard);
};

const generateDeck = () => {
  const deck = ([] as Card[]);

  for (let rank = 0; rank < RANK.RANK_COUNT; rank++) {
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
* moves a card from the top of the stockpile
* to the top of the waste (beginning of array)
*/
const fromStockpileToWaste = (stockpile: Card[], waste: Card[]) => {
  waste.unshift(stockpile.shift());
  waste[0].isVisible = true;
};

/*
* Reverses the waste and moves it into the stockpile,
* then empties the waste.
*/
const refillStockpile = (stockpile: Card[], waste: Card[]) => {
  if (stockpile.length === 0 && waste.length !== 0) {
    stockpile = waste.reverse();
    stockpile = stockpile.map((card: Card) => { card.isVisible = false; return card; })
    waste = ([] as Card[]);
  }
  return { stockpile, waste };
};

const validFoundations = ['f1', 'f2', 'f3', 'f4'] as const;
type FoundationNames = (typeof validFoundations)[number];
const isValidFoundation =
  (x: any): x is FoundationNames => validFoundations.includes(x);

const validPiles = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'] as const;
type PileNames = (typeof validPiles)[number];
const isValidPile =
  (x: any): x is PileNames => validPiles.includes(x);

const fromWasteToFoundation = (waste: Card[], foundations: Foundations, foIndex?: FoundationNames) => {
  try {
    /*
    * if the waste is empty, throw a warning and return the params as-is
    */
    if (waste.length === 0) {
      throw errors.invalidMove;
    }
    /*
    * save the first card in the waste to compare at the end
    */
    const cardToMove = waste[0];

    if (foIndex) {
      const foLength = foundations[foIndex].length;
      if (waste[0].rank === RANK.RANK_A) {
        foundations[foIndex].push(waste.shift());
      } else if (
        foLength &&
        isSameSuit(waste[0], foundations[foIndex][0]) &&
        isInSequence(foundations[foIndex][0], waste[0])) {
        foundations[foIndex].unshift(waste.shift());
      }
      if (waste.length) { waste[0].isVisible = true; }

    } else {

      /*
      * if the card is an Ace, look for the first empty foudnation to put it in
      */
      if (waste[0].rank === RANK.RANK_A) {
        for (const f in foundations) {
          if (foundations[f].length === 0) {
            foundations[f].push(waste.shift());
            if (waste.length) { waste[0].isVisible = true; }
            break;
          }
        }
      } else {
        /*
        * if it's not an Ace, look for the foundation that
        * matches it's suit and check if it's sequential. if
        * it is, move it from the the pile to the top of the
        * foundation (beginning of the array)
        */
        for (const f in foundations) {
          if (foundations[f].length > 0 &&
            isSameSuit(foundations[f][0], waste[0]) &&
            isInSequence(foundations[f][0], waste[0])) {
            foundations[f].unshift(waste.shift());
            if (waste.length) { waste[0].isVisible = true; }
            break;
          }
        }
      }
    }

    /*
    * if card at the top of the waste is the same as it was
    * before that means this was not valid to move, so throw a warning
    */
    if (waste.length && cardToMove === waste[0]) {
      throw errors.invalidMove;
    }

  } catch (error) {
    console.warn(yellow(error.message));
  }
  return { waste, foundations };
};
const fromPileToFoundation = (cardPile: Card[], foundations: Foundations) => {
  try {
    /* if the card pile is empty, throw a warning and return the params as-is */
    if (cardPile.length === 0) {
      throw errors.invalidMove;
    }
    /* save the first card in the card pile to compare at the end */
    const cardToMove = cardPile[cardPile.length - 1];

    /* if the card is an Ace, look for the first empty foudnation to put it in */
    if (cardToMove.rank === RANK.RANK_A) {
      for (const f in foundations) {
        if (foundations[f].length === 0) {
          foundations[f].push(cardPile.pop());
          if (cardPile.length) { cardPile[cardPile.length - 1].isVisible = true; }
          break;
        }
      }
    } else {
      /* if it's not an Ace, look for the foundation that
      matches it's suit and check if it's sequential. if
      it is, move it from the the pile to the top of the
      foundation (beginning of the array) */
      for (const f in foundations) {
        if (foundations[f].length > 0 &&
          isSameSuit(foundations[f][0], cardPile[cardPile.length - 1]) &&
          isInSequence(foundations[f][0], cardPile[cardPile.length - 1])) {
          foundations[f].unshift(cardPile.pop());
          if (cardPile.length) { cardPile[cardPile.length - 1].isVisible = true; }
          break;
        }
      }
    }

    /* if card at the top of the card pile is the same as it was
    before that means this was not valid to move, so throw a warning */
    if (cardPile.length && cardToMove === cardPile[cardPile.length - 1]) {
      throw errors.invalidMove;
    }

  } catch (error) {
    console.warn(yellow(error.message));
  }
  return { cardPile, foundations };
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
      (isInSequence(waste[0], pile[pile.length - 1]) &&
        isAlternateColor(waste[0], pile[pile.length - 1]))) {
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
};

const moveFromPileToPile = (target: Card[], index: number, destination: Card[]) => {
  if (target.length === 0
    || index > target.length
    || target[target.length - index].isVisible === false) {
    return { target, destination };
  }
  const cardsToMove = target.slice(target.length - index);
  if ((destination.length === 0) ||
    (isInSequence(cardsToMove[0], destination[destination.length - 1]) &&
      isAlternateColor(cardsToMove[0], destination[destination.length - 1]))) {
    cardsToMove.forEach((card: Card) => {
      target.pop();
      destination.push(card);
    });
    if (target.length && !target[target.length - 1].isVisible) {
      target[target.length - 1].isVisible = true;
    }
  }
  return { target, destination };
}

const fromFoundationToPile = (foundation: Card[], pile: Card[]) => {
  try {
    if (!foundation.length) {
      throw errors.invalidMove;
    }

    const cardToMove = foundation[foundation.length - 1];

    if (!pile.length || canBePlacedOnBottom(pile[pile.length - 1], cardToMove)) {
      pile.push(foundation.pop());
    }
    if (foundation.length && cardToMove === foundation[foundation.length - 1]) {
      throw errors.invalidMove;
    }
  } catch (error) {
    console.warn(yellow(error.message));
  } finally {
    return { foundation, pile };
  }
}

const initiateGame = () => {
  const shuffledDeck = shuffleDeck(generateDeck());
  const piles = [
    [] as Card[],
    [] as Card[],
    [] as Card[],
    [] as Card[],
    [] as Card[],
    [] as Card[],
    [] as Card[],
  ];

  for (let i = 0; i < piles.length; i++) {
    for (let f = 0; f < i + 1; f++) {
      piles[i].push(shuffledDeck.shift());
      if (f === i) { piles[i][f].isVisible = true; }
    }
  }

  const gameState: GameState = {
    stockpile: shuffledDeck,
    waste: [] as Card[],
    foundations: {
      f1: [] as Card[],
      f2: [] as Card[],
      f3: [] as Card[],
      f4: [] as Card[],
    } as Foundations,
    piles,
  };

  return gameState;
};

const displayBoard = ({ stockpile, waste, foundations, piles }: GameState) => {
  const sotckpileCount = stockpile.length;
  const { f1, f2, f3, f4 } = foundations;
  const topOfWaste = prepareToDisplayCard(waste[0]);
  const topOfF1 = prepareToDisplayCard(f1[0]);
  const topOfF2 = prepareToDisplayCard(f2[0]);
  const topOfF3 = prepareToDisplayCard(f3[0]);
  const topOfF4 = prepareToDisplayCard(f4[0]);
  const maxPileSize = Math.max(piles[0].length,
    piles[1].length,
    piles[2].length,
    piles[3].length,
    piles[4].length,
    piles[5].length,
    piles[6].length);
  let displayPiles = '';
  for (let i = 0; i < maxPileSize; i++) {
    let row = ``;
    for (let currPile = 0; currPile < piles.length; currPile++) {
      if (piles[currPile][i] && piles[currPile][i].isVisible) {
        isRed(piles[currPile][i]) ?
          row += `[${prepareToDisplayCard(piles[currPile][i])}]\t` :
          row += `[${prepareToDisplayCard(piles[currPile][i])}]\t`;
      } else {
        row += ` ${prepareToDisplayCard(piles[currPile][i])}\t`;
      }
    }
    displayPiles += row + `\n`;
  }


  console.log('[Stockpile]\t[Waste]\t\t[Foundations]');
  console.log(`[${sotckpileCount}]\t\t[${topOfWaste}]\t\t[${topOfF1}] [${topOfF2}] [${topOfF3}] [${topOfF4}]`);
  console.log('====================================================================');
  console.log('Pile1\tPile2\tPile3\tPile4\tPile5\tPile6\tPile7');
  console.log(displayPiles);
};

export {
  rl,
  question,
  createCard,
  isBlack,
  isRed,
  isSameSuit,
  isAlternateColor,
  isInSequence,
  canBePlacedOnBottom,
  canBePlacedOnFoundation,
  getNumVisible,
  prepareToDisplayCard,
  generateDeck,
  shuffleDeck,
  fromStockpileToWaste,
  refillStockpile,
  fromWasteToFoundation,
  fromPileToFoundation,
  moveFromWasteToPile,
  moveFromPileToPile,
  initiateGame,
  displayBoard,
  isValidFoundation,
  isValidPile,
  fromFoundationToPile,
}