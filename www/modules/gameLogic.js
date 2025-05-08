// Game logic module

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

// Make a random valid move
function makeRandomMove(gameState) {
  const emptyCells = gameState.boardState
    .map((cell, index) => (cell === '' ? index : null))
    .filter((index) => index !== null);

  if (emptyCells.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

// Make a smart move using minimax algorithm
function makeSmartMove(gameState, depth = 1) {
  // Define minimax function
  function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
    // Check for terminal states
    const winner = getWinner(board);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (isBoardFull(board)) return 0;
    if (depth === 0) return evaluateBoard(board);

    const emptyCells = board
      .map((cell, index) => (cell === '' ? index : null))
      .filter((index) => index !== null);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const index of emptyCells) {
        const newBoard = [...board];
        newBoard[index] = 'O';
        const evaluation = minimax(newBoard, depth - 1, false, alpha, beta);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const index of emptyCells) {
        const newBoard = [...board];
        newBoard[index] = 'X';
        const evaluation = minimax(newBoard, depth - 1, true, alpha, beta);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  }

  // Helper function to get winner
  function getWinner(board) {
    for (const combo of winCombos) {
      if (
        board[combo[0]] !== '' &&
        board[combo[0]] === board[combo[1]] &&
        board[combo[1]] === board[combo[2]]
      ) {
        return board[combo[0]];
      }
    }
    return null;
  }

  // Helper function to check if board is full
  function isBoardFull(board) {
    return !board.includes('');
  }

  // Simple board evaluation function
  function evaluateBoard(board) {
    // Check for potential wins/blocks
    let score = 0;

    // Check rows, columns, and diagonals
    for (const combo of winCombos) {
      const line = [board[combo[0]], board[combo[1]], board[combo[2]]];
      const countX = line.filter((cell) => cell === 'X').length;
      const countO = line.filter((cell) => cell === 'O').length;

      // Score based on patterns
      if (countO === 2 && countX === 0) score += 5;
      if (countO === 1 && countX === 0) score += 1;
      if (countX === 2 && countO === 0) score -= 5;
    }

    // Add a small random factor for variety
    score += Math.random() * 0.2 - 0.1;

    return score;
  }

  // Find the best move
  const emptyCells = gameState.boardState
    .map((cell, index) => (cell === '' ? index : null))
    .filter((index) => index !== null);

  if (emptyCells.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const index of emptyCells) {
    const newBoard = [...gameState.boardState];
    newBoard[index] = 'O';
    const score = minimax(newBoard, depth, false);

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

// Check for a win
function checkWin(gameState, cells) {
  for (const combo of winCombos) {
    if (
      gameState.boardState[combo[0]] !== '' &&
      gameState.boardState[combo[0]] === gameState.boardState[combo[1]] &&
      gameState.boardState[combo[1]] === gameState.boardState[combo[2]]
    ) {
      // Highlight winning cells
      if (cells) {
        combo.forEach((index) => {
          cells[index].classList.add('winning-cell');
        });
      }
      return true;
    }
  }
  return false;
}

// Check for a draw
function checkDraw(gameState) {
  return !gameState.boardState.includes('');
}

// Save current game state to history
function saveGameState(gameState) {
  gameState.history.push({
    boardState: [...gameState.boardState],
    currentPlayer: gameState.currentPlayer,
  });
}

// Load saved settings from localStorage
function loadSettings(gameState) {
  try {
    const savedSettings = localStorage.getItem('quantumTicTacToeSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      gameState.soundEnabled = settings.soundEnabled ?? true;
      gameState.soundSettings = {
        ...gameState.soundSettings,
        ...settings.soundSettings,
      };
      gameState.lowEndMode = settings.lowEndMode ?? false;
      gameState.theme = settings.theme ?? 'default';
      gameState.vibrationEnabled = settings.vibrationEnabled ?? true;
      gameState.language = settings.language ?? 'en';
      
      // Apply theme
      if (gameState.theme && gameState.theme !== 'default') {
        document.body.classList.add(`theme-${gameState.theme}`);
      }
      
      // Apply low-end mode
      if (gameState.lowEndMode) {
        document.body.classList.add('low-end-mode');
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    // If there's an error, use default settings
  }
}

// Save settings to localStorage
function saveSettings(gameState) {
  try {
    const settings = {
      soundEnabled: gameState.soundEnabled,
      soundSettings: gameState.soundSettings,
      lowEndMode: gameState.lowEndMode || false,
      theme: gameState.theme || 'default',
      vibrationEnabled: gameState.vibrationEnabled !== false,
      language: gameState.language || 'en'
    };
    localStorage.setItem('quantumTicTacToeSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export {
  winCombos,
  makeRandomMove,
  makeSmartMove,
  checkWin,
  checkDraw,
  saveGameState,
  loadSettings,
  saveSettings
};