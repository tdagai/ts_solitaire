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
} from './helpers';

const playGame = async () => {
  let gameState = initiateGame();
  let userAnswer;

  console.log('Let\'s play Solitaire!');
  while (userAnswer !== 'q' && userAnswer !== 'quit') {
    console.clear();
    displayBoard(gameState);
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
                                        '[fo] = foundation\n - ');

        const [target, destination] = (userMove as string).split(',');
        console.log(target, destination);
        if (target === 'wa') {
          if (destination[0] === 'p') {
            console.log(gameState.piles[Number(destination[1]) - 1])
            moveFromWasteToPile(gameState.waste, gameState.piles[Number(destination[1]) - 1]);
          } else if (destination === 'fo') {
            const newState = fromWasteToFoundation(gameState.waste, gameState.foundations);
            gameState.waste = newState.waste;
            gameState.foundations = newState.foundations;
          }
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