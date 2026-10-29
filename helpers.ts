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

const reverseRefillStockpile = (waste: Card[], stockpile: Card[]) => {
  if (stockpile.length && waste.length) {
    waste.unshift(...stockpile.reverse());
    waste = waste.map((card: Card) => { card.isVisible = true; return card; })
    const stockpileLen = stockpile.length;
    for (let i = 0; i < stockpileLen; i++) {
      stockpile.pop();
    }
  }
  return { waste, stockpile};
}

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
  let specificFoundation: FoundationNames;
  try {
    /* if the card pile is empty, throw a warning and return the params as-is */
    if (cardPile.length === 0) {
      throw errors.invalidMove;
    }
    /* save the first card in the card pile to compare at the end */
    const cardToMove = cardPile[cardPile.length - 1];

    if (foIndex) {
      const foLength = foundations[foIndex].length;
      specificFoundation = foIndex;
      if (cardToMove.rank === RANK.RANK_A && !foLength) {
        foundations[foIndex].push(cardPile.pop());
      } else if (
        foLength &&
        isSameSuit(cardToMove, foundations[foIndex][0]) &&
        isInSequence(foundations[foIndex][0], cardToMove)) {
        foundations[foIndex].unshift(cardPile.pop());

        /*
          * Reveal the next card in the pile
        */
        if (cardPile.length) { cardPile[cardPile.length - 1].isVisible = true; }
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
      /*
        * if the card is an Ace, look for the
        * first empty foudnation to put it in
      */
      if (cardToMove.rank === RANK.RANK_A) {
        for (const f in foundations) {
          if (foundations[f].length === 0) {
            foundations[f].push(cardPile.pop());
            if (cardPile.length) { cardPile[cardPile.length - 1].isVisible = true; }
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
            isSameSuit(foundations[f][0], cardToMove) &&
            isInSequence(foundations[f][0], cardToMove)) {
            foundations[f].unshift(cardPile.pop());
            if (cardPile.length) { cardPile[cardPile.length - 1].isVisible = true; }
            specificFoundation = f as FoundationNames;
            break;
          }
        }
      }
    }


    /* if card at the top of the card pile is the same as it was
    before that means this was not valid to move, so throw a warning */
    if (cardPile.length && cardToMove === cardPile[cardPile.length]) {
      throw errors.invalidMove;
    }

  } catch (error) {
    warning = error.message;
  }
  return { cardPile, foundations, warning, specificFoundation };
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
  } finally {
    return warning;
  }
};

const reverseWasteToPile = (cardPile: Card[], waste: Card[]) => {
  waste.unshift(cardPile.pop());
  return { cardPile, waste };
}

const reverseWasteToFoundation = (foundation: Card[], waste: Card[]) => {
  waste.unshift(foundation.shift());
  return { foundation, waste };
}

const moveFromPileToPile = (target: Card[], index: number, destination: Card[]) => {
  let warning = '';
  try {
    if (target.length === 0) {
      throw errors.invalidTarget;
    } else if (index <= 0 || index > target.length) {
      throw errors.invalidIndex;
    } else if (target[target.length - index].isVisible === false) {
      throw errors.notVisibleError;
    }
    const cardsToMove = target.slice(target.length - index);
    if ((destination.length === 0) ||
      (isInSequence(cardsToMove[0], destination[destination.length - 1]) &&
        isAlternateColor(cardsToMove[0], destination[destination.length - 1]))) {
      cardsToMove.forEach((card: Card) => {
        target.pop();
        destination.push(card);
      });
      if (target.length > 0 && !target[target.length - 1].isVisible) {
        target[target.length - 1].isVisible = true;
      }
    } else if (!isInSequence(cardsToMove[0], destination[destination.length - 1])) {
      throw errors.notInSequence;
    } else if (!isAlternateColor(cardsToMove[0], destination[destination.length - 1])) {
      throw errors.notAlternatingColor;
    }
  } catch (error) {
    warning = error.message;
  } finally {
    return warning;
  }
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
  { move, target, destination, index, stockpileRefilledFlag }: GameAction
) => {
  if (warning.length === 0 && move !== 'un' && move !== 'undo') {
    if (move === 'dr' || move === 'draw') {
      actions.push({ move, target: 'st', destination: 'wa', stockpileRefilledFlag })
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

const reversePileToFoundation = (pile: Card[], foundation: Card[]) => {
  if (pile.length) {
    pile[pile.length - 1].isVisible = false;
  }
  pile.push(foundation.shift());
  return { pile, foundation };
}

const reverseFoundationToPile = (foundation: Card[], pile: Card[]) => {
  if (pile.length > 1 && pile[pile.length - 2].isVisible === false) {
    pile[pile.length - 1].isVisible = false;
  }
  foundation.push(pile.pop());
  return { foundation, pile };
}

const undoLastMove = (gameState: GameState) => {
  const {
    move,
    target,
    destination,
    index,
    stockpileRefilledFlag
  }: GameAction = gameState.actions[gameState.actions.length - 1];

  switch (move) {
    case 'dr':
    case 'draw': {
      if (stockpileRefilledFlag === true) {
        reverseRefillStockpile(gameState.waste, gameState.stockpile)
      } else {
        reverseDraw(gameState.waste, gameState.stockpile);
      }
      break;
    }
    case 'mv':
    case 'move': {
      if (target === 'wa') {
        if (isValidPile(destination)) {
          const destPile = Number(destination[1]) - 1;
          reverseWasteToPile(gameState.piles[destPile], gameState.waste);
        } else if (isValidFoundation(destination)) {
          reverseWasteToFoundation(gameState.foundations[destination], gameState.waste);
        }
      } else if (isValidPile(target)) {
        const tPile = Number(target[1]) - 1;
        if (isValidPile(destination)) {
          const dPile = Number(destination[1]) - 1;
          reversePileToPile(gameState.piles[dPile], index, gameState.piles[tPile]);
        } else if (isValidFoundation(destination)) {
          reversePileToFoundation(gameState.piles[tPile], gameState.foundations[destination]);
        }
      } else if (isValidFoundation(target)) {
        const dPile = Number(destination[1]) - 1;
        reverseFoundationToPile(gameState.foundations[target], gameState.piles[dPile]);
      }
      break;
    }
    default: {
      break;
    }
  }
  removeFromActionList(gameState);
  return gameState;
}

const devDrawWholeDeck = ({ stockpile, waste }: GameState) => {
  const numCardsInStockpile = stockpile.length;
  for (let i = 0; i < numCardsInStockpile - 1; i++) {
    fromStockpileToWaste(stockpile, waste);
  }
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
  isValidDestination,
  isValidTarget,
  fromFoundationToPile,
  recordMove,
  undoLastMove,
  devDrawWholeDeck,
}