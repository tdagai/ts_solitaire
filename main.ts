// import { inspect } from 'util';
import { yellow } from 'chalk';
import {
  rl,
  question,
  initiateGame,
  displayBoard,
  fromStockpileToWaste,
  refillStockpile,
  moveFromWasteToPile,
  fromWasteToFoundation,
  fromPileToFoundation,
  moveFromPileToPile,
  isValidFoundation,
  fromFoundationToPile,
  isValidPile,
  isValidDestination,
  isValidTarget,
  reverseLastMove,
  recordMove,
} from './helpers';
import { errors } from './constants';
import { Destinations, Targets } from './types/types';

const playGame = async () => {
  let gameState = initiateGame();
  let userAnswer;
  let index = 0;
  let target: Targets;
  let destination: Destinations;

  console.log('Let\'s play Solitaire!');
  while (userAnswer !== 'q' && userAnswer !== 'quit') {
    console.clear();
    index = 0;
    displayBoard(gameState);
    if (gameState.warning.length) {
      console.warn(yellow(gameState.warning));
      gameState.warning = '';
    }
    userAnswer = await question('What is your next move?\n - ');

    switch ((userAnswer as string).toLowerCase()) {
      case 'dr':
      case 'draw': {
        if (gameState.stockpile.length) {
          fromStockpileToWaste(gameState.stockpile, gameState.waste);
        } else {
          const result = refillStockpile(gameState.stockpile, gameState.waste);
          gameState.stockpile = result.stockpile;
          gameState.waste = result.waste;
          fromStockpileToWaste(gameState.stockpile, gameState.waste);
        }
        break;
      }
      case 'mv':
      case 'move': {
        const userMove = await question('pick your target and destination '+
                                        '(comma separated, no spaces)\n'+
                                        '[wa] = waste\t'+
                                        '[p#] = pile #\t'+
                                        '[fo] = foundation\t'+
                                        '[f#] = foundation #\n - ');

        const [sTarget, sDestination] = (userMove as string).split(',');
        if (isValidDestination(sDestination) && isValidTarget(sTarget)) {
          target = sTarget as Targets;
          destination = sDestination as Destinations;
        } else if (!isValidDestination(sDestination)) {
          gameState.warning = errors.invalidDest.message;
          break;
        } else if (!isValidTarget(sTarget) ) {
          gameState.warning = errors.invalidTarget.message;
          break;
        }

        if (target === 'wa') {
          if (isValidPile(destination)) {
            const newState = moveFromWasteToPile(gameState.waste, gameState.piles[Number(destination[1]) - 1]);
            gameState.waste = newState.waste;
            gameState.piles[Number(destination[1]) - 1] = newState.pile;
            gameState.warning = newState.warning;
          } else if (destination === 'fo') {
            const newState = fromWasteToFoundation(gameState.waste, gameState.foundations);
            gameState.waste = newState.waste;
            gameState.foundations = newState.foundations;
            gameState.warning = newState.warning;
            destination = newState.specificFoundation;
          } else if (isValidFoundation(destination)) {
            const newState = fromWasteToFoundation(gameState.waste, gameState.foundations, destination);
            gameState.waste = newState.waste;
            gameState.foundations = newState.foundations;
            gameState.warning = newState.warning;
          } else {
            gameState.warning = errors.invalidDest.message;
          }
        } else if (isValidPile(target)) {
          const targetPile = Number(target[1]) - 1;
          if (destination === 'fo') {
            const newState = fromPileToFoundation(gameState.piles[targetPile], gameState.foundations);

            gameState.piles[targetPile] = newState.cardPile;
            gameState.foundations = newState.foundations;
            gameState.warning = newState.warning;
          } else if (isValidFoundation(destination)) {
            const newState = fromPileToFoundation(gameState.piles[targetPile], gameState.foundations, destination);
            gameState.piles[targetPile] = newState.cardPile;
            gameState.foundations = newState.foundations;
            gameState.warning = newState.warning;
          } else if (isValidPile(destination)) {
            const destPile = Number(destination[1]) - 1;
            index = (await question('what index would  you like to start at?\n - ') as number);
            const newState = moveFromPileToPile(gameState.piles[targetPile], index, gameState.piles[destPile]);
            gameState.piles[targetPile] = newState.target;
            gameState.piles[destPile] = newState.destination;
            gameState.warning = newState.warning;
          }
        } else if (isValidFoundation(target) && isValidPile(destination)) {
          const newState = fromFoundationToPile(
            gameState.foundations[target],
            gameState.piles[Number(destination[1]) - 1]);
          gameState.foundations[target] = newState.foundation;
          gameState.piles[Number(destination[1]) - 1] = newState.pile;
          gameState.warning = newState.warning;
        } else {
          gameState.warning = errors.invalidTarget.message;
        }
        break;
      }
      case 'un':
      case 'undo': {
        gameState = reverseLastMove(gameState);
        break;
      }
      case 'q':
      case 'quit': {
        rl.close();
        break;
      }
      default: {
        console.log('Please select a valid menu option.');
        break;
      }
    }
    const newState = recordMove(gameState, { move: userAnswer, target, destination, index });
    gameState.actions = newState.actions;
    gameState.numMoves = newState.numMoves;
  }
}

playGame();