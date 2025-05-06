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
};

// DOM Elements
const cells = document.querySelectorAll('.cell');
const resetBtn = document.getElementById('reset');
const undoBtn = document.getElementById('undo');
const statusText = document.getElementById('status');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const difficultyContainer = document.getElementById('difficulty-container');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const winModal = document.getElementById('win-modal');
const modalMessage = document.getElementById('modal-message');
const playAgainBtn = document.getElementById('play-again');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

// Win combinations
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

// Translations (to unify language)
const translations = {
  turnMessage: "Player {0}'s Turn",
  winMessage: 'Player {0} Wins!',
  drawMessage: "It's a Draw!",
  playerX: 'PLAYER X',
  playerO: 'PLAYER O',
};

// Initialize the game
function initGame() {
  // Set up canvas
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  // Add floating elements
  addFloatingElements();

  // Add event listeners
  resetBtn.addEventListener('click', resetGame);
  undoBtn.addEventListener('click', undoMove);
  playAgainBtn.addEventListener('click', closeModal);

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      gameState.mode = e.target.value;
      difficultyContainer.style.display = gameState.mode === 'ai' ? 'flex' : 'none';
      resetGame();
    });
  });

  difficultyRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      gameState.difficulty = e.target.value;
      if (gameState.currentPlayer === 'O' && gameState.mode === 'ai') {
        setTimeout(makeAIMove, 500);
      }
    });
  });

  cells.forEach((cell) => {
    cell.addEventListener('click', () => handleCellClick(cell));
  });

  // Update UI
  updateScoreDisplay();
  updateTurnIndicator();
}

// Handle cell click
function handleCellClick(cell) {
  if (
    gameState.gameOver ||
    cell.textContent !== '' ||
    (gameState.mode === 'ai' && gameState.currentPlayer === 'O')
  )
    return;

  const index = parseInt(cell.getAttribute('data-index'));
  makeMove(index);

  if (!gameState.gameOver && gameState.mode === 'ai' && gameState.currentPlayer === 'O') {
    setTimeout(makeAIMove, 500);
  }
}

// Format string with placeholders
function formatString(str, ...args) {
  return str.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });
}

// Make a move
function makeMove(index) {
  if (gameState.boardState[index] !== '' || gameState.gameOver) return false;

  // Save current state for undo
  gameState.history.push({
    boardState: [...gameState.boardState],
    currentPlayer: gameState.currentPlayer,
  });

  // Update board state
  gameState.boardState[index] = gameState.currentPlayer;
  cells[index].textContent = gameState.currentPlayer;
  cells[index].classList.add(gameState.currentPlayer === 'X' ? 'x-move' : 'o-move');

  // Add particle effects
  createParticles(cells[index]);

  // Check for win or draw
  const winCombo = checkWin();
  if (winCombo) {
    endGame(formatString(translations.winMessage, gameState.currentPlayer), winCombo);
    gameState.scores[gameState.currentPlayer]++;
    updateScoreDisplay();
    showConfetti();
    return true;
  }

  if (checkDraw()) {
    endGame(translations.drawMessage);
    gameState.scores.ties++;
    updateScoreDisplay();
    return true;
  }

  // Switch player
  gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
  updateTurnIndicator();
  return true;
}

// AI move
function makeAIMove() {
  if (gameState.gameOver) return;

  let index;

  switch (gameState.difficulty) {
    case 'easy':
      index = getRandomMove();
      break;
    case 'medium':
      index = Math.random() > 0.5 ? getBestMove(3) : getRandomMove();
      break;
    case 'hard':
      index = getBestMove(5);
      break;
    default:
      index = getRandomMove();
  }

  makeMove(index);
}

// Get random available move
function getRandomMove() {
  const availableMoves = gameState.boardState
    .map((cell, index) => (cell === '' ? index : null))
    .filter((cell) => cell !== null);

  if (availableMoves.length === 0) return -1; // No moves available
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Minimax algorithm for AI
function getBestMove(depth) {
  // If AI can win in one move, make that move
  for (let i = 0; i < 9; i++) {
    if (gameState.boardState[i] === '') {
      gameState.boardState[i] = 'O';
      if (checkWinForPlayer('O')) {
        gameState.boardState[i] = '';
        return i;
      }
      gameState.boardState[i] = '';
    }
  }

  // If player can win in one move, block that move
  for (let i = 0; i < 9; i++) {
    if (gameState.boardState[i] === '') {
      gameState.boardState[i] = 'X';
      if (checkWinForPlayer('X')) {
        gameState.boardState[i] = '';
        return i;
      }
      gameState.boardState[i] = '';
    }
  }

  // For hard difficulty, use center if available
  if (gameState.difficulty === 'hard' && gameState.boardState[4] === '') {
    return 4;
  }

  // For medium/hard, try to fork or block forks
  if (gameState.difficulty !== 'easy') {
    // Try corners first
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((i) => gameState.boardState[i] === '');

    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Try edges if no corners available
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter((i) => gameState.boardState[i] === '');

    if (availableEdges.length > 0) {
      return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
  }

  // Otherwise, make a random move
  return getRandomMove();
}

// Check if player can win
function checkWinForPlayer(player) {
  return winCombos.some((combo) => combo.every((index) => gameState.boardState[index] === player));
}

// Undo the last move
function undoMove() {
  if (gameState.history.length === 0) return;

  const lastState = gameState.history.pop();
  gameState.boardState = lastState.boardState;
  gameState.currentPlayer = lastState.currentPlayer;
  gameState.gameOver = false;

  // Update UI
  for (let i = 0; i < 9; i++) {
    cells[i].textContent = gameState.boardState[i];
    cells[i].classList.remove('x-move', 'o-move', 'winning-cell');
    if (gameState.boardState[i] === 'X') {
      cells[i].classList.add('x-move');
    } else if (gameState.boardState[i] === 'O') {
      cells[i].classList.add('o-move');
    }
  }

  statusText.textContent = formatString(translations.turnMessage, gameState.currentPlayer);
  updateTurnIndicator();
}

// Check for win
function checkWin() {
  for (const combo of winCombos) {
    if (
      gameState.boardState[combo[0]] !== '' &&
      gameState.boardState[combo[0]] === gameState.boardState[combo[1]] &&
      gameState.boardState[combo[0]] === gameState.boardState[combo[2]]
    ) {
      return combo;
    }
  }
  return null;
}

// Check for draw
function checkDraw() {
  return gameState.boardState.every((cell) => cell !== '');
}

// End the game
function endGame(message, winCombo) {
  gameState.gameOver = true;
  statusText.textContent = message;

  if (winCombo) {
    winCombo.forEach((index) => {
      cells[index].classList.add('winning-cell');
    });
  }

  // Show modal
  modalMessage.textContent = message;
  winModal.classList.add('active');
}

// Close the modal
function closeModal() {
  winModal.classList.remove('active');
  resetGame();
}

// Reset the game
function resetGame() {
  gameState.boardState = Array(9).fill('');
  gameState.currentPlayer = 'X';
  gameState.gameOver = false;
  gameState.history = [];

  // Update UI
  cells.forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('x-move', 'o-move', 'winning-cell');
  });

  statusText.textContent = formatString(translations.turnMessage, gameState.currentPlayer);
  updateTurnIndicator();

  // Clear any remaining particles
  document.querySelectorAll('.particle').forEach((p) => p.remove());

  // If AI mode and AI starts
  if (gameState.mode === 'ai' && gameState.currentPlayer === 'O') {
    setTimeout(makeAIMove, 500);
  }
}

// Update score display
function updateScoreDisplay() {
  // Update player labels to use translations
  scoreX.querySelector('span:first-child').textContent = translations.playerX;
  scoreO.querySelector('span:first-child').textContent = translations.playerO;

  // Update scores
  scoreX.querySelector('span:last-child').textContent = gameState.scores.X;
  scoreO.querySelector('span:last-child').textContent = gameState.scores.O;
}

// Update turn indicator
function updateTurnIndicator() {
  statusText.textContent = formatString(translations.turnMessage, gameState.currentPlayer);
  scoreX.classList.toggle('active-player', gameState.currentPlayer === 'X');
  scoreO.classList.toggle('active-player', gameState.currentPlayer === 'O');
}

// Create particles
function createParticles(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 8 + 3;
    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100;
    const rotation = Math.random() * 360;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);

    if (gameState.currentPlayer === 'X') {
      particle.style.backgroundColor = 'var(--primary)';
    } else {
      particle.style.backgroundColor = 'var(--secondary)';
    }

    document.body.appendChild(particle);

    // Remove particle after animation completes
    setTimeout(() => {
      if (particle && particle.parentNode) {
        particle.remove();
      }
    }, 1000);
  }
}

// Show confetti
function showConfetti() {
  const colors =
    gameState.currentPlayer === 'X'
      ? ['#05d9e8', '#d1f7ff', '#0389fa']
      : ['#ff2a6d', '#ffc2d1', '#ff7096'];

  const confettiCount = 200;
  const confetti = [];

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  // Create confetti particles
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * 6.28,
      rotation: Math.random() * 0.2 - 0.1,
      rotationSpeed: Math.random() * 0.01 - 0.005,
    });
  }

  // Animation loop
  let animationFrame;
  const animateConfetti = () => {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let stillFalling = false;
    confetti.forEach((p) => {
      p.y += p.speed;
      p.x += Math.sin(p.angle) * 0.5;
      p.angle += p.rotation;
      p.rotation += p.rotationSpeed;

      if (p.y < confettiCanvas.height) {
        stillFalling = true;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (stillFalling) {
      animationFrame = requestAnimationFrame(animateConfetti);
    } else {
      cancelAnimationFrame(animationFrame);
    }
  };

  animationFrame = requestAnimationFrame(animateConfetti);

  // Safety cleanup after some time
  setTimeout(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }, 10000); // 10 seconds max
}

// Add floating elements in background
function addFloatingElements() {
  // Clear existing floating elements first
  document.querySelectorAll('.floating').forEach((el) => el.remove());

  const symbols = ['X', 'O', '0', '1'];
  const count = 20;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.classList.add('floating');
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.fontSize = `${Math.random() * 30 + 20}px`;
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.animationDuration = `${Math.random() * 30 + 20}s`;
    el.style.animationDelay = `${Math.random() * 5}s`;

    if (Math.random() > 0.5) {
      el.style.color = 'var(--primary)';
    } else {
      el.style.color = 'var(--secondary)';
    }

    document.body.appendChild(el);
  }
}

// Initialize on window load
window.addEventListener('load', initGame);
window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});
