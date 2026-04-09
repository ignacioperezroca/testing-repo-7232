export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 160;

export const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function createInitialState(random = Math.random) {
  const snake = [
    { x: 2, y: 8 },
    { x: 1, y: 8 },
    { x: 0, y: 8 }
  ];

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    food: createFoodPosition(GRID_SIZE, snake, random),
    score: 0,
    isGameOver: false,
    isPaused: false
  };
}

export function queueDirection(state, direction) {
  if (!DIRECTION_VECTORS[direction]) {
    return state;
  }

  if (OPPOSITE_DIRECTIONS[state.direction] === direction && state.snake.length > 1) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction
  };
}

export function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused
  };
}

export function stepGame(state, random = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = getResolvedDirection(state.direction, state.nextDirection, state.snake.length);
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
  const willGrow = positionsEqual(nextHead, state.food);
  const baseSnake = willGrow ? state.snake : state.snake.slice(0, -1);

  if (isOutsideGrid(nextHead, state.gridSize) || hasSelfCollision(nextHead, baseSnake)) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      isGameOver: true
    };
  }

  const snake = [nextHead, ...baseSnake];
  const food = willGrow ? createFoodPosition(state.gridSize, snake, random) : state.food;

  return {
    ...state,
    snake,
    direction,
    nextDirection: direction,
    food,
    score: state.score + (willGrow ? 1 : 0)
  };
}

export function createFoodPosition(gridSize, snake, random = Math.random) {
  const occupied = new Set(snake.map(toKey));
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = { x, y };
      if (!occupied.has(toKey(cell))) {
        openCells.push(cell);
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

export function positionsEqual(a, b) {
  return Boolean(a && b) && a.x === b.x && a.y === b.y;
}

export function toKey(position) {
  return `${position.x},${position.y}`;
}

function isOutsideGrid(position, gridSize) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}

function hasSelfCollision(position, snake) {
  return snake.some((segment) => positionsEqual(segment, position));
}

function getResolvedDirection(currentDirection, nextDirection, snakeLength) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return currentDirection;
  }

  if (snakeLength > 1 && OPPOSITE_DIRECTIONS[currentDirection] === nextDirection) {
    return currentDirection;
  }

  return nextDirection;
}
