import test from "node:test";
import assert from "node:assert/strict";

import {
  createFoodPosition,
  createInitialState,
  queueDirection,
  stepGame
} from "../src/gameLogic.js";

test("moves the snake forward in the active direction", () => {
  const state = createInitialState(() => 0);
  const nextState = stepGame(state, () => 0);

  assert.deepEqual(nextState.snake, [
    { x: 3, y: 8 },
    { x: 2, y: 8 },
    { x: 1, y: 8 }
  ]);
  assert.equal(nextState.score, 0);
});

test("grows and increases score when food is eaten", () => {
  const state = {
    ...createInitialState(() => 0),
    food: { x: 3, y: 8 }
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.score, 1);
  assert.equal(nextState.snake.length, 4);
  assert.deepEqual(nextState.snake[0], { x: 3, y: 8 });
});

test("prevents direct reversal into the snake body", () => {
  const state = createInitialState(() => 0);
  const queued = queueDirection(state, "left");

  assert.equal(queued.nextDirection, "right");
});

test("marks the game over on wall collision", () => {
  const state = {
    ...createInitialState(() => 0),
    snake: [{ x: 15, y: 8 }],
    direction: "right",
    nextDirection: "right"
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.isGameOver, true);
});

test("marks the game over on self collision", () => {
  const state = {
    ...createInitialState(() => 0),
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 }
    ],
    direction: "left",
    nextDirection: "down"
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.isGameOver, true);
});

test("places food only on open cells", () => {
  const food = createFoodPosition(
    2,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ],
    () => 0
  );

  assert.deepEqual(food, { x: 1, y: 1 });
});
