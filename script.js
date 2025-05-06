const cells = document.querySelectorAll('.cell');
const reset = document.getElementById('reset');
let currentPlayer = 'X';
let gameOver = false;

const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const xMoves = [];
const oMoves = [];

function checkWin(playerMoves) {
  return winCombos.find((combo) => combo.every((index) => playerMoves.includes(index)));
}

function colors(indices) {
  indices.forEach((i) => {
    cells[i].style.backgroundColor = 'lightgreen';
  });
}

function resetting() {
  cells.forEach((cell) => {
    cell.textContent = '';
    cell.style.backgroundColor = '#eee';
  });
  xMoves.length = 0;
  oMoves.length = 0;
  currentPlayer = 'X';
  gameOver = false;
}

reset.addEventListener('click', resetting);

cells.forEach((cell) =>
  cell.addEventListener('click', () => {
    if (gameOver || cell.textContent !== '') return;

    const index = Number(cell.getAttribute('data-index'));
    cell.textContent = currentPlayer;

    if (currentPlayer === 'X') {
      xMoves.push(index);
      const winCombo = checkWin(xMoves);
      if (winCombo) {
        colors(winCombo);
        alert('X ha vinto!');
        gameOver = true;
        return;
      }
    } else {
      oMoves.push(index);
      const winCombo = checkWin(oMoves);
      if (winCombo) {
        colors(winCombo);
        alert('O ha vinto!');
        gameOver = true;
        return;
      }
    }

    // 🟰 Controllo pareggio
    if (xMoves.length + oMoves.length === 9) {
      alert('Pareggio!');
      gameOver = true;
      return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  })
);
