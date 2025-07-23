/* --- Particle Background --- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particlesArray;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < 50; i++) {
    particlesArray.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

/* --- Tic Tac Toe Game Logic --- */
const board = document.getElementById('board');
const turnIndicator = document.getElementById('turnIndicator');
const winnerMessage = document.getElementById('winnerMessage');
const restartBtn = document.getElementById('restartBtn');
const modeBtn = document.getElementById('modeBtn');
const moveSound = document.getElementById('moveSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');

const xScoreEl = document.getElementById('xScore');
const oScoreEl = document.getElementById('oScore');
const drawScoreEl = document.getElementById('drawScore');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let vsAI = false;

let xWins = 0, oWins = 0, draws = 0;

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleCellClick(i));
    board.appendChild(cell);
  }
}

function handleCellClick(index) {
  if (!gameActive || gameState[index] !== "") return;

  makeMove(index, currentPlayer);
  moveSound.play();
  if (checkResult()) return;

  if (vsAI && gameActive) {
    setTimeout(() => {
      aiMove();
    }, 500);
  } else {
    switchPlayer();
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  board.children[index].textContent = player;
  board.children[index].classList.add(player.toLowerCase());
}

function switchPlayer() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  turnIndicator.textContent = `Turn: ${currentPlayer}`;
}

function checkResult() {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      highlightWinningLine(condition);
      displayWinner(`${gameState[a]} Wins!`);
      gameActive = false;
      updateScore(gameState[a]);
      winSound.play();
      return true;
    }
  }

  if (!gameState.includes("")) {
    displayWinner("It's a Draw!");
    draws++;
    drawScoreEl.textContent = `Draws: ${draws}`;
    gameActive = false;
    drawSound.play();
    return true;
  }

  return false;
}

function highlightWinningLine(cells) {
  const positions = [
    {x: 50, y: 50}, {x: 160, y: 50}, {x: 270, y: 50},
    {x: 50, y: 160}, {x: 160, y: 160}, {x: 270, y: 160},
    {x: 50, y: 270}, {x: 160, y: 270}, {x: 270, y: 270}
  ];

  const start = positions[cells[0]];
  const end = positions[cells[2]];
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);

  const line = document.createElement('div');
  line.classList.add('winning-line');
  line.style.width = '0';
  line.style.top = `${start.y}px`;
  line.style.left = `${start.x}px`;
  line.style.transform = `rotate(${Math.atan2(deltaY, deltaX)}rad)`;
  line.style.transition = 'width 0.4s ease';

  board.appendChild(line);

  setTimeout(() => {
    line.style.width = `${length}px`;
  }, 50);
}

function displayWinner(message) {
  winnerMessage.textContent = message;
  winnerMessage.classList.add('show');
}

function restartGame() {
  currentPlayer = 'X';
  gameActive = true;
  gameState = ["", "", "", "", "", "", "", "", ""];
  winnerMessage.textContent = '';
  winnerMessage.classList.remove('show');
  turnIndicator.textContent = `Turn: ${currentPlayer}`;
  createBoard();
}

function updateScore(player) {
  if (player === 'X') {
    xWins++;
    xScoreEl.textContent = `X Wins: ${xWins}`;
  } else {
    oWins++;
    oScoreEl.textContent = `O Wins: ${oWins}`;
  }
}

function aiMove() {
  const bestMove = findBestMove();
  makeMove(bestMove, 'O');
  moveSound.play();

  if (!checkResult()) {
    currentPlayer = 'X';
    turnIndicator.textContent = `Turn: ${currentPlayer}`;
  }
}

function findBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (gameState[i] === "") {
      gameState[i] = 'O';
      let score = minimax(gameState, 0, false);
      gameState[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(boardState, depth, isMaximizing) {
  if (checkWinner('O')) return 10 - depth;
  if (checkWinner('X')) return depth - 10;
  if (!boardState.includes("")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === "") {
        boardState[i] = 'O';
        let score = minimax(boardState, depth + 1, false);
        boardState[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === "") {
        boardState[i] = 'X';
        let score = minimax(boardState, depth + 1, true);
        boardState[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinner(player) {
  return winningConditions.some(condition => {
    const [a, b, c] = condition;
    return gameState[a] === player && gameState[b] === player && gameState[c] === player;
  });
}

restartBtn.addEventListener('click', restartGame);

modeBtn.addEventListener('click', () => {
  vsAI = !vsAI;
  modeBtn.textContent = vsAI ? "Mode: Player vs AI" : "Mode: Player vs Player";
  restartGame();
});

createBoard();
