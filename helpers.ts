import { red, dim } from 'chalk';
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
import { SUIT, RANK, errors } from "./constants"
import {
  Card,
  Foundations,
  GameAction,
  GameState,
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

const reverseDraw = (waste: Card[], stockpile: Card[]) => {
  stockpile.unshift(waste.shift());
  stockpile[0].isVisible = false;
  return { waste, stockpile };
}

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

const validDestinations = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'fo', 'f1', 'f2', 'f3', 'f4', 'wa'] as const;
type DestinationNames = (typeof validDestinations)[number];
const isValidDestination =
  (x: any): x is DestinationNames => validDestinations.includes(x);

const isValidTarget = (target: any) => {
  return target === 'wa' || isValidDestination(target);
}

const fromWasteToFoundation = (waste: Card[], foundations: Foundations, foIndex?: FoundationNames) => {
  let warning = '';
  let specificFoundation: FoundationNames;
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
      specificFoundation = foIndex;
      if (waste[0].rank === RANK.RANK_A) {
        foundations[foIndex].push(waste.shift());
      } else if (
        foLength &&
        isSameSuit(waste[0], foundations[foIndex][0]) &&
        isInSequence(foundations[foIndex][0], waste[0])) {
        foundations[foIndex].unshift(waste.shift());
      }
    } else {
      /*
      * if the card is an Ace, look for the first empty foudnation to put it in
      */
      if (waste[0].rank === RANK.RANK_A) {
        for (const f in foundations) {
          if (foundations[f].length === 0) {
            foundations[f].push(waste.shift());
            if (waste.length) { waste[0].isVisible = true; }
            specificFoundation = f as FoundationNames;
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
            specificFoundation = f as FoundationNames;
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
    warning = error.message;
  }
  return { waste, foundations, warning, specificFoundation };
};
const fromPileToFoundation = (cardPile: Card[], foundations: Foundations, foIndex?: FoundationNames) => {
  let warning = '';
  try {
    /* if the card pile is empty, throw a warning and return the params as-is */
    if (cardPile.length === 0) {
      throw errors.invalidMove;
    }
    /* save the first card in the card pile to compare at the end */
    const cardToMove = cardPile[cardPile.length - 1];

    if (foIndex) {
      const foLength = foundations[foIndex].length;
      if (cardToMove.rank === RANK.RANK_A && !foLength) {
        foundations[foIndex].push(cardPile.pop());
      } else if (
        foLength &&
        isSameSuit(cardToMove, foundations[foIndex][0]) &&
        isInSequence(foundations[foIndex][0], cardToMove)) {
        foundations[foIndex].unshift(cardPile.pop());
      } else {
        if (!foLength) {
          throw errors.emptyFoundationError;
        } else if (!isInSequence(foundations[foIndex][0], cardToMove[0])) {
          throw errors.notInSequence;
        } else if (!isSameSuit(cardToMove[0], foundations[foIndex][0])) {
          throw errors.suitNotMatching;
        }
      }
    } else {
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
            isSameSuit(foundations[f][0], cardToMove) &&
            isInSequence(foundations[f][0], cardToMove)) {
            foundations[f].unshift(cardPile.pop());
            if (cardPile.length) { cardPile[cardPile.length - 1].isVisible = true; }
            break;
          }
        }
      }
    }


    /* if card at the top of the card pile is the same as it was
    before that means this was not valid to move, so throw a warning */
    if (cardPile.length && cardToMove === cardPile[cardPile.length - 1]) {
      throw errors.invalidMove;
    }

  } catch (error) {
    warning = error.message;
  }
  return { cardPile, foundations, warning };
};

const moveFromWasteToPile = (waste: Card[], pile: Card[]) => {
  let warning = '';
  try {
    /* if the waste is empty, throw a warning and return the params as-is */
    if (waste.length === 0) {
      throw errors.emptyWasteError;
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
      if (!isInSequence(waste[0], pile[pile.length - 1])) {
        throw errors.notInSequence;
      } else if (!isAlternateColor(waste[0], pile[pile.length - 1])) {
        throw errors.notAlternatingColor;
      } else {
        throw errors.invalidMove;
      }
    }

  } catch (error) {
    warning = error.message;
  }
  return { waste, pile, warning };
};

const returnToWaste = (cardPile: Card[], waste: Card[]) => {
  waste.unshift(cardPile.pop());
  return { cardPile, waste };
}

const moveFromPileToPile = (target: Card[], index: number, destination: Card[]) => {
  let warning = '';
  if (target.length === 0) {
    warning = errors.invalidTarget.message;
    return { target, destination, warning };
  } else if (index <= 0 || index > target.length) {
    warning = errors.invalidIndex.message;
    return { target, destination, warning };
  } else if (target[target.length - index].isVisible === false) {
    warning = errors.notVisibleError.message;
    return { target, destination, warning };
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
  return { target, destination, warning };
}

const fromFoundationToPile = (foundation: Card[], pile: Card[]) => {
  let warning = '';
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
    warning = error.message;
  } finally {
    return { foundation, pile, warning };
  }
}

const prepareToDisplayAction = (action: GameAction) => {
  let preparedAction = '';
  if (action.move === 'dr' || action.move === 'draw') {
    preparedAction = 'draw a card';
  } else if (action.move === 'mv' || action.move === 'move') {
    if (action.index) {
      preparedAction = `moved ${action.index} ${action.index > 1 ? 'cards' : 'card'} from ${action.target} ➡️  ${action.destination}`;
    } else {
      preparedAction = `moved ${action.target} ➡️  ${action.destination}`;
    }
  }
  return preparedAction;
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
    warning: '',
    numMoves: 0,
    actions: [] as GameAction[],
  };

  return gameState;
};

const displayBoard = ({
  stockpile,
  waste,
  foundations,
  piles,
  numMoves,
  actions,
}: GameState) => {
  const sotckpileCount = stockpile.length;
  const { f1, f2, f3, f4 } = foundations;
  const topOfWaste = prepareToDisplayCard(waste[0]);
  const topOfF1 = prepareToDisplayCard(f1[0]);
  const topOfF2 = prepareToDisplayCard(f2[0]);
  const topOfF3 = prepareToDisplayCard(f3[0]);
  const topOfF4 = prepareToDisplayCard(f4[0]);
  const lastAction = actions.length ? prepareToDisplayAction(actions[actions.length - 1]) : undefined;
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


  console.log('[Stockpile]\t[Waste]\t\t[Foundations]\t\t[Moves]');
  console.log(`[${sotckpileCount}]\t\t[${topOfWaste}]\t\t[${topOfF1}] [${topOfF2}] [${topOfF3}] [${topOfF4}]\t\t[${numMoves}]`);
  console.log('====================================================================');
  console.log('Pile1\tPile2\tPile3\tPile4\tPile5\tPile6\tPile7');
  console.log(displayPiles);
  console.log(`Last action: ${lastAction ? lastAction : 'No Actions Taken'}`)
};

const removeFromActionList = (gameState: GameState) => {
  gameState.actions.pop();
  gameState.numMoves--;
}

const recordMove = (
  { warning, actions, numMoves }: GameState,
  { move, target, destination, index }: GameAction
) => {
  if (warning.length === 0 && move !== 'un' && move !== 'undo') {
    if (move === 'dr' || move === 'draw') {
      actions.push({ move, target: 'st', destination: 'wa' })
    } else if (index) {
      actions.push({ move, target, destination, index })
    } else {
      actions.push({ move, target, destination })
    }
    numMoves++
  }
  return { actions, numMoves };
}

const reversePileToPile = (destination: Card[], index: number, target: Card[]) => {
  if (target.length) {
    target[target.length - 1].isVisible = false;
  }
  const cardsToMove = destination.slice(destination.length - index);
  cardsToMove.forEach((card: Card) => {
    destination.pop();
    target.push(card);
  });
  return { target, destination };
}

const reverseLastMove = (gameState: GameState) => {
  const { move,
    target,
    destination,
    index
  }: GameAction = gameState.actions[gameState.actions.length - 1];

  switch (move) {
    case 'dr':
    case 'draw': {
      const newState = reverseDraw(gameState.waste, gameState.stockpile);
      gameState.waste = newState.waste;
      gameState.stockpile = newState.stockpile;
      removeFromActionList(gameState);
      break;
    }
    case 'mv':
    case 'move': {
      if (target === 'wa') {
        if (isValidPile(destination)) {
          const destPile = Number(destination[1]) - 1;
          const newState = returnToWaste(gameState.piles[destPile], gameState.waste);
          gameState.piles[destPile] = newState.cardPile;
          gameState.waste = newState.waste;
          removeFromActionList(gameState);
        } else if (isValidFoundation(destination)) {
          const newState = returnToWaste(gameState.foundations[destination], gameState.waste);
          gameState.foundations[destination] = newState.cardPile;
          gameState.waste = newState.waste;
          removeFromActionList(gameState);
        }
      } else if (isValidPile(target)) {
        if (isValidPile(destination)) {
          const tPile = Number(target[1]) - 1;
          const dPile = Number(destination[1]) - 1;
          const newState = reversePileToPile(gameState.piles[dPile], index, gameState.piles[tPile]);
          gameState.piles[tPile] = newState.target;
          gameState.piles[dPile] = newState.destination;
          removeFromActionList(gameState);
        }
      }
      break;
    }
    default: {
      break;
    }
  }
  return gameState;
}

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
  returnToWaste,
  moveFromPileToPile,
  initiateGame,
  displayBoard,
  isValidFoundation,
  isValidPile,
  isValidDestination,
  isValidTarget,
  fromFoundationToPile,
  recordMove,
  reverseLastMove,
}