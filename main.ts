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
} from './helpers';

const playGame = async () => {
  let gameState = initiateGame();
  let userAnswer;

  console.log('Let\'s play Solitaire!');
  while (userAnswer !== 'q' && userAnswer !== 'quit') {
    console.clear();
    displayBoard(gameState);
    if (gameState.warning.length) { console.log(yellow(gameState.warning)) }
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

        const [target, destination] = (userMove as string).split(',');
        if (target === 'wa') {
          if (isValidPile(destination)) {
            moveFromWasteToPile(gameState.waste, gameState.piles[Number(destination[1]) - 1]);
          } else if (destination === 'fo') {
            const newState = fromWasteToFoundation(gameState.waste, gameState.foundations);
            gameState.waste = newState.waste;
            gameState.foundations = newState.foundations;
            gameState.warning = newState.warning;
          } else if (isValidFoundation(destination)) {
            fromWasteToFoundation(gameState.waste, gameState.foundations, destination);
          }
        } else if (isValidPile(target)) {
          const targetPile = Number(target[1]) - 1;
          if (destination === 'fo') {
            const newState = fromPileToFoundation(gameState.piles[targetPile], gameState.foundations);

            gameState.piles[targetPile] = newState.cardPile;
            gameState.foundations = newState.foundations;
          } else if (isValidPile(destination)) {
            const destPile = Number(destination[1]) - 1;
            const pileIndex = await question('what index would  you like to start at?\n - ');
            const newState = moveFromPileToPile(gameState.piles[targetPile], (pileIndex as number), gameState.piles[destPile]);
            gameState.piles[targetPile] = newState.target;
            gameState.piles[destPile] = newState.destination;
          }
        } else if (isValidFoundation(target) && isValidPile(destination)) {
          const newState = fromFoundationToPile(
            gameState.foundations[target],
            gameState.piles[Number(destination[1]) - 1]);
          gameState.foundations[target] = newState.foundation;
          gameState.piles[Number(destination[1]) - 1] = newState.pile;
        }
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
  }
}

playGame();