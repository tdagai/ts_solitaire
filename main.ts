import { inspect } from 'util';
import {
  rl,
  question,
  initiateGame,
  displayBoard,
  fromStockpileToWaste,
} from './helpers';

const playGame = async () => {
  let gameState = initiateGame();
  let userAnswer;

  console.log('Let\'s play Solitaire!');
  console.log(inspect(gameState, false, null, true));

  while (userAnswer !== 'q' && userAnswer !== 'quit') {
    displayBoard(gameState);
    userAnswer = await question('What is your next move?\n - ');

    switch ((userAnswer as string).toLowerCase()) {
      case 'dr':
      case 'draw': {
        fromStockpileToWaste(gameState.stockpile, gameState.waste);
        break;
      }
      case 'mv':
      case 'move': {

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