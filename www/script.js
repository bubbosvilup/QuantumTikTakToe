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

// Audio elements
const sounds = {
  move: {
    X: new Audio(), // X move sound
    O: new Audio(), // O move sound
  },
  win: new Audio(),
  draw: new Audio(),
  click: new Audio(),
  hover: new Audio(),
  bgMusic: {
    scifi: new Audio(),
    ambient: new Audio(),
    cyber: new Audio(),
    current: null, // Will be set to one of the above
  },
};

// Music tracks
const musicTracks = {
  scifi: {
    title: 'Sci-Fi Atmosphere',
    src: 'sounds/scifi.mp3',
  },
  ambient: {
    title: 'Digital Ambience',
    src: 'sounds/digital.mp3',
  },
  cyber: {
    title: 'Cyber Pulse',
    src: 'sounds/pulse.mp3',
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
  // Load saved settings
  loadSettings();

  // Set up canvas
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  // Initialize sounds
  initSounds();

  // Add floating elements
  addFloatingElements();

  // Add event listeners
  resetBtn.addEventListener('click', () => {
    playSound('click');
    resetGame();
  });

  undoBtn.addEventListener('click', () => {
    playSound('click');
    undoMove();
  });

  playAgainBtn.addEventListener('click', () => {
    playSound('click');
    closeModal();
    resetBoard();
  });

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      playSound('click');
      gameState.mode = e.target.value;
      difficultyContainer.style.display = gameState.mode === 'ai' ? 'flex' : 'none';
      resetGame();
    });
  });

  difficultyRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      playSound('click');
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
        playSound('hover');
      }
    });
  });

  // Create sound controls
  createSoundControls();

  // Update UI
  updateScoreDisplay();
  updateTurnIndicator();

  // Start background music
  playBackgroundMusic();
}

// Load saved settings from localStorage
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem('quantumTicTacToeSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      gameState.soundEnabled = settings.soundEnabled ?? true;
      gameState.soundSettings = {
        ...gameState.soundSettings,
        ...settings.soundSettings,
      };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    // If there's an error, use default settings
  }
}

// Save settings to localStorage
function saveSettings() {
  try {
    const settings = {
      soundEnabled: gameState.soundEnabled,
      soundSettings: gameState.soundSettings,
    };
    localStorage.setItem('quantumTicTacToeSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Initialize sound objects
function initSounds() {
  // Sound URLs
  const soundSources = {
    'move.X': 'sounds/move.wav', // X move sound (digital click)
    'move.O': 'sounds/move.wav', // O move sound (different tone)
    win: 'sounds/win.wav', // Win celebration
    draw: 'sounds/draw.wav', // Game over sound
    click: 'sounds/click.wav', // UI click sound
    hover: 'sounds/hover.wav', // Hover sound
  };

  // Set up each sound effect
  sounds.move.X.src = soundSources['move.X'];
  sounds.move.X.preload = 'auto';
  sounds.move.X.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.move.O.src = soundSources['move.O'];
  sounds.move.O.preload = 'auto';
  sounds.move.O.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.win.src = soundSources.win;
  sounds.win.preload = 'auto';
  sounds.win.volume = gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.draw.src = soundSources.draw;
  sounds.draw.preload = 'auto';
  sounds.draw.volume = gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.click.src = soundSources.click;
  sounds.click.preload = 'auto';
  sounds.click.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.hover.src = soundSources.hover;
  sounds.hover.preload = 'auto';
  sounds.hover.volume =
    0.2 * gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume; // Lower volume for hover

  // Set up music tracks
  Object.entries(musicTracks).forEach(([key, track]) => {
    sounds.bgMusic[key].src = track.src;
    sounds.bgMusic[key].preload = 'auto';
    sounds.bgMusic[key].loop = true;
    sounds.bgMusic[key].volume =
      gameState.soundSettings.musicVolume * gameState.soundSettings.masterVolume;
  });

  // Set current track
  sounds.bgMusic.current = sounds.bgMusic[gameState.soundSettings.currentTrack];

  // Add error handling
  const allSounds = [
    sounds.move.X,
    sounds.move.O,
    sounds.win,
    sounds.draw,
    sounds.click,
    sounds.hover,
    ...Object.values(sounds.bgMusic),
  ];

  allSounds.forEach((sound) => {
    if (sound instanceof Audio) {
      sound.addEventListener('error', () => {
        console.log('Error loading sound');
        // Disable sounds on error
        gameState.soundEnabled = false;
      });
    }
  });
}

// Update sound volumes
function updateSoundVolumes() {
  // Update effects volumes
  sounds.move.X.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.move.O.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.win.volume = gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.draw.volume = gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.click.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.hover.volume =
    0.2 * gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  // Update music volumes
  Object.values(sounds.bgMusic).forEach((track) => {
    if (track instanceof Audio) {
      track.volume = gameState.soundSettings.musicVolume * gameState.soundSettings.masterVolume;
    }
  });

  // Save settings
  saveSettings();
}

// Change background music track
function changeBackgroundMusic(trackKey) {
  if (!musicTracks[trackKey]) return;

  // Fade out current track if playing
  if (sounds.bgMusic.current && !sounds.bgMusic.current.paused) {
    const fadeOutInterval = setInterval(() => {
      if (sounds.bgMusic.current.volume > 0.05) {
        sounds.bgMusic.current.volume -= 0.05;
      } else {
        clearInterval(fadeOutInterval);
        sounds.bgMusic.current.pause();
        sounds.bgMusic.current.currentTime = 0;

        // Set new track and play
        gameState.soundSettings.currentTrack = trackKey;
        sounds.bgMusic.current = sounds.bgMusic[trackKey];
        playBackgroundMusic(true); // true indicates fade in
      }
    }, 50);
  } else {
    // Just set new track and play
    gameState.soundSettings.currentTrack = trackKey;
    sounds.bgMusic.current = sounds.bgMusic[trackKey];
    playBackgroundMusic();
  }

  // Save settings
  saveSettings();
}

// Play a sound by key
function playSound(key, player = null) {
  if (!gameState.soundEnabled) return;

  let soundToPlay;

  // Handle move sounds differently for X and O
  if (key === 'move' && player) {
    soundToPlay = sounds.move[player];
  } else {
    soundToPlay = sounds[key];
  }

  if (!soundToPlay) return;

  // Stop and reset the sound first (allows for rapid triggering)
  soundToPlay.pause();
  soundToPlay.currentTime = 0;

  // Play the sound with a promise catch for browsers that restrict autoplay
  const playPromise = soundToPlay.play();

  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.log('Playback prevented by browser');
      // Could show a "Click to enable sound" message here
    });
  }
}

// Play background music
function playBackgroundMusic(fadeIn = false) {
  if (!gameState.soundEnabled || !sounds.bgMusic.current) return;

  // Set initial volume if fading in
  if (fadeIn) {
    sounds.bgMusic.current.volume = 0;
  }

  // Try to play background music with user interaction handling
  const playPromise = sounds.bgMusic.current.play();

  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.log('Background music autoplay prevented');

      // Add a one-time click listener to start music on user interaction
      const startAudio = () => {
        sounds.bgMusic.current.play();
        document.removeEventListener('click', startAudio);
      };
      document.addEventListener('click', startAudio);
    });
  }

  // Fade in if requested
  if (fadeIn) {
    const fadeInInterval = setInterval(() => {
      const targetVolume =
        gameState.soundSettings.musicVolume * gameState.soundSettings.masterVolume;
      if (sounds.bgMusic.current.volume < targetVolume) {
        sounds.bgMusic.current.volume += 0.05;
        if (sounds.bgMusic.current.volume >= targetVolume) {
          sounds.bgMusic.current.volume = targetVolume;
          clearInterval(fadeInInterval);
        }
      } else {
        clearInterval(fadeInInterval);
      }
    }, 50);
  }
}

// Create sound controls
function createSoundControls() {
  // Create container for sound controls
  const soundControlsContainer = document.createElement('div');
  soundControlsContainer.className = 'sound-controls hidden';
  soundControlsContainer.id = 'sound-controls';

  // Create sound toggle button
  const soundToggleBtn = document.createElement('button');
  soundToggleBtn.className = 'sound-toggle';
  soundToggleBtn.innerHTML = gameState.soundEnabled
    ? '<i class="fas fa-volume-up"></i>'
    : '<i class="fas fa-volume-mute"></i>';
  soundToggleBtn.id = 'sound-toggle';

  // Add event listener to toggle sound
  soundToggleBtn.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundToggleBtn.innerHTML = gameState.soundEnabled
      ? '<i class="fas fa-volume-up"></i>'
      : '<i class="fas fa-volume-mute"></i>';

    // Toggle sound controls visibility
    const soundControls = document.getElementById('sound-controls');
    if (soundControls) {
      soundControls.classList.toggle('hidden', !gameState.soundEnabled);
    }

    // Play or pause music based on state
    if (gameState.soundEnabled) {
      playBackgroundMusic();
    } else {
      if (sounds.bgMusic.current) {
        sounds.bgMusic.current.pause();
      }
    }

    // Save settings
    saveSettings();
  });

  // Create master volume control
  const masterVolumeControl = createVolumeControl(
    'Master Volume',
    gameState.soundSettings.masterVolume,
    (value) => {
      gameState.soundSettings.masterVolume = parseFloat(value);
      updateSoundVolumes();
    }
  );

  // Create music volume control
  const musicVolumeControl = createVolumeControl(
    'Music Volume',
    gameState.soundSettings.musicVolume,
    (value) => {
      gameState.soundSettings.musicVolume = parseFloat(value);
      updateSoundVolumes();
    }
  );

  // Create effects volume control
  const effectsVolumeControl = createVolumeControl(
    'Effects Volume',
    gameState.soundSettings.effectsVolume,
    (value) => {
      gameState.soundSettings.effectsVolume = parseFloat(value);
      updateSoundVolumes();
    }
  );

  // Create soundtrack selector
  const soundtrackSelector = document.createElement('div');
  soundtrackSelector.className = 'volume-control';

  const soundtrackLabel = document.createElement('label');
  soundtrackLabel.textContent = 'Soundtrack:';

  const soundtrackSelect = document.createElement('select');
  soundtrackSelect.className = 'soundtrack-select';

  // Add options for each soundtrack
  Object.entries(musicTracks).forEach(([key, track]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = track.title;
    option.selected = key === gameState.soundSettings.currentTrack;
    soundtrackSelect.appendChild(option);
  });

  // Add event listener to change soundtrack
  soundtrackSelect.addEventListener('change', (e) => {
    changeBackgroundMusic(e.target.value);
  });

  soundtrackSelector.appendChild(soundtrackLabel);
  soundtrackSelector.appendChild(soundtrackSelect);

  // Add all controls to container
  soundControlsContainer.appendChild(masterVolumeControl);
  soundControlsContainer.appendChild(musicVolumeControl);
  soundControlsContainer.appendChild(effectsVolumeControl);
  soundControlsContainer.appendChild(soundtrackSelector);

  // Add container and toggle button to DOM
  document.querySelector('.controls').appendChild(soundToggleBtn);
  document.querySelector('.container').appendChild(soundControlsContainer);

  // Show sound controls if sound is enabled
  soundControlsContainer.classList.toggle('hidden', !gameState.soundEnabled);
}

// Helper function to create volume controls
function createVolumeControl(labelText, initialValue, onChange) {
  const container = document.createElement('div');
  container.className = 'volume-control';

  const label = document.createElement('label');
  label.textContent = labelText;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1';
  slider.step = '0.1';
  slider.value = initialValue;
  slider.className = 'volume-slider';

  slider.addEventListener('input', (e) => {
    onChange(e.target.value);
  });

  container.appendChild(label);
  container.appendChild(slider);

  return container;
}

// Handle cell clicks
function handleCellClick(cell) {
  const index = cell.dataset.index;

  // Check if the cell is already taken or game is over
  if (gameState.boardState[index] || gameState.gameOver) {
    return;
  }

  // Make move
  makeMove(index);

  // If playing against AI and it's O's turn, make AI move
  if (gameState.mode === 'ai' && gameState.currentPlayer === 'O' && !gameState.gameOver) {
    setTimeout(makeAIMove, 500);
  }
}

// Make a move
function makeMove(index) {
  // Save current state to history
  saveGameState();

  // Update board state
  gameState.boardState[index] = gameState.currentPlayer;

  // Update UI
  updateCell(index);

  // Play move sound
  playSound('move', gameState.currentPlayer);

  // Add particle effect
  createMoveParticles(index);

  // Check for win or draw
  if (checkWin()) {
    handleWin();
  } else if (checkDraw()) {
    handleDraw();
  } else {
    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
  }
}

// AI move function
function makeAIMove() {
  if (gameState.gameOver) return;

  let index;

  switch (gameState.difficulty) {
    case 'easy':
      index = makeRandomMove();
      break;
    case 'medium':
      // 70% chance of smart move, 30% chance of random
      index = Math.random() < 0.7 ? makeSmartMove(1) : makeRandomMove();
      break;
    case 'hard':
      // Smart move with deeper look ahead
      index = makeSmartMove(2);
      break;
    default:
      index = makeRandomMove();
  }

  // Make the move
  if (index !== null) {
    makeMove(index);
  }
}

// Make a random valid move
function makeRandomMove() {
  const emptyCells = gameState.boardState
    .map((cell, index) => (cell === '' ? index : null))
    .filter((index) => index !== null);

  if (emptyCells.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

// Make a smart move using minimax algorithm
function makeSmartMove(depth = 1) {
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

// Update a cell in the UI
function updateCell(index) {
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
function updateTurnIndicator() {
  const message = translations.turnMessage.replace('{0}', gameState.currentPlayer);
  statusText.textContent = message;

  // Update active player highlight
  const playerXScore = document.getElementById('score-x');
  const playerOScore = document.getElementById('score-o');

  playerXScore.classList.toggle('active-player', gameState.currentPlayer === 'X');
  playerOScore.classList.toggle('active-player', gameState.currentPlayer === 'O');
}

// Check for a win
function checkWin() {
  for (const combo of winCombos) {
    if (
      gameState.boardState[combo[0]] !== '' &&
      gameState.boardState[combo[0]] === gameState.boardState[combo[1]] &&
      gameState.boardState[combo[1]] === gameState.boardState[combo[2]]
    ) {
      // Highlight winning cells
      combo.forEach((index) => {
        cells[index].classList.add('winning-cell');
      });
      return true;
    }
  }
  return false;
}

// Check for a draw
function checkDraw() {
  return !gameState.boardState.includes('');
}

// Handle win scenario
function handleWin() {
  gameState.gameOver = true;

  // Update score
  gameState.scores[gameState.currentPlayer]++;
  updateScoreDisplay();

  // Show win message
  const message = translations.winMessage.replace('{0}', gameState.currentPlayer);
  statusText.textContent = message;

  // Show modal
  modalMessage.textContent = message;
  showModal();

  // Play win sound
  playSound('win');

  // Show confetti
  createConfetti();
}

// Handle draw scenario
function handleDraw() {
  gameState.gameOver = true;

  // Update score
  gameState.scores.ties++;
  updateScoreDisplay();

  // Show draw message
  statusText.textContent = translations.drawMessage;

  // Show modal
  modalMessage.textContent = translations.drawMessage;
  showModal();

  // Play draw sound
  playSound('draw');
}

// Update score display
function updateScoreDisplay() {
  scoreX.querySelector('span:last-child').textContent = gameState.scores.X;
  scoreO.querySelector('span:last-child').textContent = gameState.scores.O;
}

// Reset the board
function resetBoard() {
  // Reset game state
  gameState.currentPlayer = 'X';
  gameState.gameOver = false;
  gameState.boardState = Array(9).fill('');
  gameState.history = [];

  // Reset UI
  cells.forEach((cell, index) => {
    cell.textContent = '';
    cell.classList.remove('x-move', 'o-move', 'winning-cell');
  });

  // Update turn indicator
  updateTurnIndicator();
}

// Reset the entire game
function resetGame() {
  resetBoard();

  // Reset scores
  gameState.scores = {
    X: 0,
    O: 0,
    ties: 0,
  };

  // Update score display
  updateScoreDisplay();
}

// Save current game state to history
function saveGameState() {
  gameState.history.push({
    boardState: [...gameState.boardState],
    currentPlayer: gameState.currentPlayer,
  });
}

// Undo the last move
function undoMove() {
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
  updateTurnIndicator();
}

// Show modal
function showModal() {
  winModal.classList.add('active');
}

// Close modal
function closeModal() {
  winModal.classList.remove('active');
  resetBoard();

  // If playing against AI and it's O's turn, make AI move
  if (gameState.mode === 'ai' && gameState.currentPlayer === 'O') {
    setTimeout(makeAIMove, 500);
  }
}

function createConfetti() {
  const confettiCount = 12; // meno elementi
  const colors = ['#05d9e8', '#ff2a6d', '#d1f7ff', '#16213e'];
  const confettiItems = [];

  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = 0; i < confettiCount; i++) {
    confettiItems.push({
      x: Math.random() * confettiCanvas.width,
      y: -20,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 1,
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let stillActive = false;

    confettiItems.forEach((item) => {
      item.y += item.speed;

      if (item.y < confettiCanvas.height) {
        stillActive = true;
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, item.size, item.size);
      }
    });

    if (stillActive) {
      setTimeout(() => requestAnimationFrame(animate), 30);
    }
  };

  animate();
}

function createMoveParticles(index) {
  const cell = cells[index];
  const rect = cell.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particleCount = 8; // meno particelle
  const color = gameState.currentPlayer === 'X' ? '#05d9e8' : '#ff2a6d';

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;

    const size = Math.random() * 6 + 3;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 60 + 20;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);

    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 800);
  }
}

function addFloatingElements() {
  const shapes = ['circle', 'square'];
  const container = document.body;

  for (let i = 0; i < 10; i++) {
    const element = document.createElement('div');
    element.className = 'floating';

    element.style.left = `${Math.random() * 100}%`;
    element.style.top = `${Math.random() * 100}%`;

    const size = Math.random() * 30 + 10;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    if (shape === 'circle') {
      element.style.borderRadius = '50%';
    }

    element.style.background =
      Math.random() > 0.5 ? 'rgba(5, 217, 232, 0.05)' : 'rgba(255, 42, 109, 0.05)';

    const duration = Math.random() * 20 + 20;
    const delay = Math.random() * 3;
    element.style.animationDuration = `${duration}s`;
    element.style.animationDelay = `${delay}s`;

    container.appendChild(element);
  }
}

// Responsive resize handler
window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

// Initialize the game
window.addEventListener('DOMContentLoaded', initGame);
