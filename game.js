const crypto = require('crypto');
const Table = require('cli-table3');

class MoveValidator {
  static validateMoves(moves) {
    if (moves.length < 3) {
      throw new Error('Error: At least 3 moves required.');
    }
    if (moves.length % 2 === 0) {
      throw new Error('Error: The number of moves must be odd.');
    }

    const uniqueMoves = new Set(moves);
    if (uniqueMoves.size !== moves.length) {
      throw new Error('Error: Moves must be unique.');
    }
  }
}

class RulesGenerator {
  static generateRulesTable(moves) {
    const size = moves.length;
    const table = Array.from({ length: size }, () => Array(size).fill(''));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i === j) {
          table[i][j] = 'Draw';
        } else if ((j > i && j - i <= size / 2) || (j < i && i - j > size / 2)) {
          table[i][j] = 'Win';
        } else {
          table[i][j] = 'Lose';
        }
      }
    }
    return table;
  }

  static displayHelp(moves, rulesTable) {
    const table = new Table({
      head: ['Moves', ...moves]
    });

    for (let i = 0; i < rulesTable.length; i++) {
      table.push([moves[i], ...rulesTable[i]]);
    }

    console.log(table.toString());
  }
}

class CryptoHelper {
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateHMAC(key, message) {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
  }
}

class Game {
  constructor(moves) {
    this.moves = moves;
    this.rulesTable = RulesGenerator.generateRulesTable(moves);
    this.computerMoveIndex = null;
    this.key = CryptoHelper.generateKey();
  }

  generateComputerMove() {
    this.computerMoveIndex = Math.floor(Math.random() * this.moves.length);
    const computerMove = this.moves[this.computerMoveIndex];
    const hmac = CryptoHelper.generateHMAC(this.key, computerMove);
    console.log(`HMAC: ${hmac}`);
  }

  playUserMove(userMoveIndex) {
    const userMove = this.moves[userMoveIndex];
    const computerMove = this.moves[this.computerMoveIndex];

    console.log(`Your move: ${userMove}`);
    console.log(`Computer move: ${computerMove}`);

    if (this.rulesTable[userMoveIndex][this.computerMoveIndex] === 'Win') {
      console.log('You win!');
    } else if (this.rulesTable[userMoveIndex][this.computerMoveIndex] === 'Lose') {
      console.log('You lose!');
    } else {
      console.log('It\'s a draw!');
    }

    console.log(`HMAC key: ${this.key}`);
  }

  displayMenu() {
    console.log('Available moves:');
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log('0 - exit');
    console.log('? - help');
  }
}

function main() {
  try {
    const moves = process.argv.slice(2);
    
    if (moves.length === 0) {
      throw new Error('Error: No moves provided. Please provide an odd number of moves (>= 3).');
    }

    MoveValidator.validateMoves(moves);

    const game = new Game(moves);
    game.generateComputerMove();
    game.displayMenu();

    process.stdin.on('data', (input) => {
      const userInput = input.toString().trim();

      if (userInput === '0') {
        console.log('Exiting game.');
        process.exit(0);
      } else if (userInput === '?') {
        RulesGenerator.displayHelp(moves, game.rulesTable);
      } else {
        const userMoveIndex = parseInt(userInput, 10) - 1;
        if (userMoveIndex >= 0 && userMoveIndex < moves.length) {
          game.playUserMove(userMoveIndex);
          process.exit(0);
        } else {
          console.log('Invalid choice, please try again.');
          game.displayMenu();
        }
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log('Usage: node game.js move1 move2 move3 ... (Provide an odd number of unique moves >= 3)');
  }
}

main();
