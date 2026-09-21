export const boardWidth = 30;
export const boardHeight = 20;
export const snakeLengthDelta = 3;
export const scoreDelta = 5;
export const gameTickDelta = 0;

export type Position = number[];

export interface SnakeState {
    paused: boolean;
    gameover: boolean;
    score: number;
    snakeDirection: string;
    snakeHeadPosition: Position;
    snakeBody: Position[];
    foodPosition: Position;
    snakeLength: number;
    gameTickInterval: number;
}

export const samePosition = (p1: Position, p2: Position) => p1[0] === p2[0] && p1[1] === p2[1];

export const initialSnakeState = (): SnakeState => ({
    paused: false,
    gameover: false,
    score: 0,
    snakeDirection: '>',
    snakeHeadPosition: [boardHeight / 2, 3],
    snakeBody: [],
    foodPosition: [boardHeight / 2, boardWidth / 2],
    snakeLength: 1,
    gameTickInterval: 110
});

export const randomPosition = (rng: () => number): Position =>
    [Math.floor(rng() * boardHeight), Math.floor(rng() * boardWidth)];

// direction the snake will take after a key press; it can only turn perpendicular to its current axis
export const nextDirection = (currentDirection: string, key: string): string =>
    !['^', 'v'].includes(currentDirection) ?
        ((key === 'ArrowUp' || key === 'W' || key === 'w') ? '^' :
        (key === 'ArrowDown' || key === 'S' || key === 's') ? 'v' : currentDirection) :
    !['<', '>'].includes(currentDirection) ?
        ((key === 'ArrowLeft' || key === 'A' || key === 'a') ? '<' :
        (key === 'ArrowRight' || key === 'D' || key === 'd') ? '>' : currentDirection)
    : currentDirection;

// advance the snake one square; walls and the snake's own body end the game
export const stepSnake = (state: SnakeState): SnakeState => {
    if (state.paused || state.gameover) return state;
    const dir = state.snakeDirection;
    let [y, x] = state.snakeHeadPosition;
    let snakeBody = [...state.snakeBody, [y, x]];
    x = dir === '<' ? x - 1 : dir === '>' ? x + 1 : x;
    y = dir === '^' ? y - 1 : dir === 'v' ? y + 1 : y;
    let snakeHeadPosition = state.snakeHeadPosition;
    let gameover = false;
    if (y < 0 || y > boardHeight - 1 || x < 0 || x > boardWidth - 1) {
        gameover = true;
    } else {
        snakeHeadPosition = [y, x];
        snakeBody = Array(snakeBody.length).fill([-1, -1]).concat(snakeBody);
        snakeBody = snakeBody.slice(snakeBody.length - state.snakeLength);
        gameover = snakeBody.some(part => samePosition(part, snakeHeadPosition));
    }
    return { ...state, snakeBody, snakeHeadPosition, gameover };
};

// move the food somewhere off the snake's body, grow the snake, and add to the score
export const eatFood = (state: SnakeState, rng: () => number): SnakeState => {
    let foodPosition: Position;
    do {
        foodPosition = randomPosition(rng);
    } while (state.snakeBody.some(part => samePosition(foodPosition, part)));
    return {
        ...state,
        foodPosition,
        snakeLength: state.snakeLength + snakeLengthDelta,
        score: state.score + scoreDelta,
        gameTickInterval: state.gameTickInterval - gameTickDelta
    };
};
