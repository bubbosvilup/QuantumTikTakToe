import { createConfetti, createMoveParticles, addFloatingElements } from './modules/animations.js';
import {
  sounds,
  initSounds,
  playSound,
  playBackgroundMusic,
} from './modules/sounds.js';
import { createSettingsMenu } from './modules/settingsMenu.js';
import {
  winCombos,
  makeRandomMove,
  makeSmartMove,
  checkWin,
  checkDraw,
  saveGameState,
  loadSettings,
  saveSettings
} from './modules/gameLogic.js';
import {
  updateTurnIndicator,
  resetBoard,
  resetGame,
  closeModal,
  makeMove,
  undoMove
} from './modules/uiLogic.js';

// Game state
const gameState = {
  currentPlayer: 'X',
  gameOver: false,
  boardState: Array(9).fill(''),
  history: [],
  mode: 'pvp',
  difficulty: 'easy',
  scores: {
    X: 0,
    O: 0,
    ties: 0,
  },
  soundEnabled: true, // Sound toggle state
  soundSettings: {
    masterVolume: 0.7, // Overall volume
    musicVolume: 0.5, // Background music volume
    effectsVolume: 0.8, // Sound effects volume
    currentTrack: 'scifi', // Current music track
  },
};

// DOM Elements
const cells = document.querySelectorAll('.cell');
const resetBtn = document.getElementById('reset');
const undoBtn = document.getElementById('undo');
const statusText = document.getElementById('status');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const difficultyContainer = document.getElementById('difficulty-container');
const winModal = document.getElementById('win-modal');
const modalMessage = document.getElementById('modal-message');
const playAgainBtn = document.getElementById('play-again');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

// Initialize the game
function initGame() {
  // Load saved settings
  loadSettings(gameState);

  // Set up canvas
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  // Initialize sounds
  initSounds(gameState, () => saveSettings(gameState));
  
  // Make sounds accessible globally for the settings menu
  window.sounds = sounds;

  // Add floating elements
  addFloatingElements(gameState);

  // Add event listeners
  resetBtn.addEventListener('click', () => {
    playSound('click', null, gameState);
    resetGame(gameState, cells);
  });

  undoBtn.addEventListener('click', () => {
    playSound('click', null, gameState);
    undoMove(gameState, cells, statusText);
  });

  playAgainBtn.addEventListener('click', () => {
    playSound('click', null, gameState);
    closeModal();
    resetBoard(gameState, cells);
    updateTurnIndicator(gameState, statusText);
    
    // If playing against AI and it's O's turn, make AI move
    if (gameState.mode === 'ai' && gameState.currentPlayer === 'O') {
      setTimeout(makeAIMove, 500);
    }
  });

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      playSound('click', null, gameState);
      gameState.mode = e.target.value;
      difficultyContainer.style.display = gameState.mode === 'ai' ? 'flex' : 'none';
      resetGame(gameState, cells);
      updateTurnIndicator(gameState, statusText);
    });
  });

  difficultyRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      playSound('click', null, gameState);
      gameState.difficulty = e.target.value;
      if (gameState.currentPlayer === 'O' && gameState.mode === 'ai') {
        setTimeout(makeAIMove, 500);
      }
    });
  });

  cells.forEach((cell) => {
    cell.addEventListener('click', () => handleCellClick(cell));

    // Add hover sound effect
    cell.addEventListener('mouseenter', () => {
      if (cell.textContent === '' && !gameState.gameOver) {
        playSound('hover', null, gameState);
      }
    });
  });

  // Create and add sound settings menu
  const settingsMenu = createSettingsMenu(gameState, () => saveSettings(gameState));
  document.querySelector('.container').appendChild(settingsMenu);

  // Update UI
  updateTurnIndicator(gameState, statusText);

  // Start background music
  playBackgroundMusic(gameState);
}

// Handle cell clicks
function handleCellClick(cell) {
  const index = cell.dataset.index;

  // Check if the cell is already taken or game is over
  if (gameState.boardState[index] || gameState.gameOver) {
    return;
  }

  // Save current state to history
  saveGameState(gameState);

  // Make move
  const gameEnded = makeMove(index, gameState, cells, statusText, modalMessage, confettiCanvas, ctx);

  // If playing against AI and it's O's turn, make AI move
  if (!gameEnded && gameState.mode === 'ai' && gameState.currentPlayer === 'O') {
    setTimeout(makeAIMove, 500);
  }
}

// AI move function
function makeAIMove() {
  if (gameState.gameOver) return;

  let index;

  switch (gameState.difficulty) {
    case 'easy':
      index = makeRandomMove(gameState);
      break;
    case 'medium':
      // 70% chance of smart move, 30% chance of random
      index = Math.random() < 0.7 ? makeSmartMove(gameState, 1) : makeRandomMove(gameState);
      break;
    case 'hard':
      // Smart move with deeper look ahead
      index = makeSmartMove(gameState, 2);
      break;
    default:
      index = makeRandomMove(gameState);
  }

  // Make the move
  if (index !== null) {
    // Save current state to history
    saveGameState(gameState);
    
    // Make move
    makeMove(index, gameState, cells, statusText, modalMessage, confettiCanvas, ctx);
  }
}

// Responsive resize handler
window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
