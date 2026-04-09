import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  queueDirection,
  stepGame,
  toKey,
  togglePause
} from "./gameLogic.js";

const boardElement = document.querySelector("#game-board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState();

function buildBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    fragment.append(cell);
  }

  boardElement.replaceChildren(fragment);
}

function render() {
  const snakeCells = new Set(state.snake.map(toKey));
  const headKey = toKey(state.snake[0]);
  const foodKey = state.food ? toKey(state.food) : null;

  Array.from(boardElement.children).forEach((cell, index) => {
    const x = index % GRID_SIZE;
    const y = Math.floor(index / GRID_SIZE);
    const key = `${x},${y}`;

    cell.className = "cell";

    if (snakeCells.has(key)) {
      cell.classList.add("cell--snake");
    }

    if (headKey === key) {
      cell.classList.add("cell--head");
    }

    if (foodKey === key) {
      cell.classList.add("cell--food");
    }
  });

  scoreElement.textContent = String(state.score);
  statusElement.textContent = state.isGameOver
    ? "Game over"
    : state.isPaused
      ? "Paused"
      : "Running";
}

function restartGame() {
  state = createInitialState();
  render();
}

function handleDirectionInput(direction) {
  if (state.isGameOver) {
    return;
  }

  state = queueDirection(state, direction);
}

function handleKeydown(event) {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    a: "left",
    s: "down",
    d: "right",
    W: "up",
    A: "left",
    S: "down",
    D: "right"
  };

  if (event.key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (event.key === "Enter" && state.isGameOver) {
    restartGame();
    return;
  }

  const direction = keyMap[event.key];

  if (!direction) {
    return;
  }

  event.preventDefault();
  handleDirectionInput(direction);
}

function tick() {
  state = stepGame(state);
  render();
}

buildBoard();
render();

window.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", restartGame);
controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleDirectionInput(button.dataset.direction);
  });
});

window.setInterval(tick, TICK_MS);
