// UI Logic module
import { playSound } from './sounds.js';
import { createConfetti, createMoveParticles, vibrate } from './animations.js';
import { checkWin, checkDraw } from './gameLogic.js';

// Translations (to unify language)
const translations = {
  turnMessage: "Player {0}'s Turn",
  winMessage: 'Player {0} Wins!',
  drawMessage: "It's a Draw!",
  playerX: 'PLAYER X',
  playerO: 'PLAYER O',
};

// Update a cell in the UI
function updateCell(index, gameState, cells) {
  const cell = cells[index];
  const mark = gameState.boardState[index];

  cell.textContent = mark;
  cell.classList.remove('x-move', 'o-move');

  if (mark === 'X') {
    cell.classList.add('x-move');
  } else if (mark === 'O') {
    cell.classList.add('o-move');
  }
}

// Update the turn indicator
function updateTurnIndicator(gameState, statusText) {
  const message = translations.turnMessage.replace('{0}', gameState.currentPlayer);
  statusText.textContent = message;

  // Update active player highlight
  const playerXScore = document.getElementById('score-x');
  const playerOScore = document.getElementById('score-o');

  playerXScore.classList.toggle('active-player', gameState.currentPlayer === 'X');
  playerOScore.classList.toggle('active-player', gameState.currentPlayer === 'O');
}

// Handle win scenario
function handleWin(gameState, statusText, modalMessage, confettiCanvas, ctx) {
  gameState.gameOver = true;

  // Update score
  gameState.scores[gameState.currentPlayer]++;
  updateScoreDisplay(gameState);

  // Show win message
  const message = translations.winMessage.replace('{0}', gameState.currentPlayer);
  statusText.textContent = message;

  // Show modal
  modalMessage.textContent = message;
  showModal();

  // Play win sound
  playSound('win', null, gameState);

  // Add vibration for win
  vibrate(200, gameState);

  // Show confetti
  createConfetti(confettiCanvas, ctx, gameState);
}

// Handle draw scenario
function handleDraw(gameState, statusText, modalMessage) {
  gameState.gameOver = true;

  // Update score
  gameState.scores.ties++;
  updateScoreDisplay(gameState);

  // Show draw message
  statusText.textContent = translations.drawMessage;

  // Show modal
  modalMessage.textContent = translations.drawMessage;
  showModal();

  // Play draw sound
  playSound('draw', null, gameState);
}

// Update score display
function updateScoreDisplay(gameState) {
  const scoreX = document.getElementById('score-x');
  const scoreO = document.getElementById('score-o');
  
  scoreX.querySelector('span:last-child').textContent = gameState.scores.X;
  scoreO.querySelector('span:last-child').textContent = gameState.scores.O;
}

// Reset the board
function resetBoard(gameState, cells) {
  // Reset game state
  gameState.currentPlayer = 'X';
  gameState.gameOver = false;
  gameState.boardState = Array(9).fill('');
  gameState.history = [];

  // Reset UI
  cells.forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('x-move', 'o-move', 'winning-cell');
  });
}

// Reset the entire game
function resetGame(gameState, cells) {
  resetBoard(gameState, cells);

  // Reset scores
  gameState.scores = {
    X: 0,
    O: 0,
    ties: 0,
  };

  // Update score display
  updateScoreDisplay(gameState);
}

// Show modal
function showModal() {
  const winModal = document.getElementById('win-modal');
  winModal.classList.add('active');
}

// Close modal
function closeModal() {
  const winModal = document.getElementById('win-modal');
  winModal.classList.remove('active');
}

// Make a move
function makeMove(index, gameState, cells, statusText, modalMessage, confettiCanvas, ctx) {
  // Update board state
  gameState.boardState[index] = gameState.currentPlayer;

  // Update UI
  updateCell(index, gameState, cells);

  // Play move sound
  playSound('move', gameState.currentPlayer, gameState);
  
  // Add short vibration for move
  vibrate(50, gameState);

  // Add particle effect
  createMoveParticles(index, cells, gameState);

  // Check for win or draw
  if (checkWin(gameState, cells)) {
    handleWin(gameState, statusText, modalMessage, confettiCanvas, ctx);
    return true;
  } else if (checkDraw(gameState)) {
    handleDraw(gameState, statusText, modalMessage);
    return true;
  } else {
    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator(gameState, statusText);
    return false;
  }
}

// Undo the last move
function undoMove(gameState, cells, statusText) {
  if (gameState.history.length === 0 || gameState.gameOver) return;

  // Get previous state
  const prevState = gameState.history.pop();

  // Restore state
  gameState.boardState = prevState.boardState;
  gameState.currentPlayer = prevState.currentPlayer;
  gameState.gameOver = false;

  // Update UI
  cells.forEach((cell, index) => {
    cell.textContent = gameState.boardState[index];
    cell.classList.remove('x-move', 'o-move', 'winning-cell');

    if (gameState.boardState[index] === 'X') {
      cell.classList.add('x-move');
    } else if (gameState.boardState[index] === 'O') {
      cell.classList.add('o-move');
    }
  });

  // Update turn indicator
  updateTurnIndicator(gameState, statusText);
}

export {
  translations,
  updateCell,
  updateTurnIndicator,
  handleWin,
  handleDraw,
  updateScoreDisplay,
  resetBoard,
  resetGame,
  showModal,
  closeModal,
  makeMove,
  undoMove
};