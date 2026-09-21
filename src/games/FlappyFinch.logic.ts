import { Utility } from '../Utility';

export const frameInterval = 10;
export const pipeXGap = 300;
export const pipeYGap = 250;
export const pipeWidth = 100;
export const gravityConstant = 0.15;
export const flapVelocity = -6.25;
export const birdSize = 40;
export const nomNomSize = 10;

export class BirdProps {
    x: number = 0;
    y: number = 0;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class PipeProps {
    x: number = 0;
    y: number = 0;
    index: number = 0;
    birdPosition: BirdProps = new BirdProps(0, 0);
    onNomNom: any;
    constructor(x: number, y: number, index: number) {
        this.x = x;
        this.y = y;
        this.index = index;
    }
}

export class FlappyFinchGameState {
    pipePositions: PipeProps[] = [];
    birdPosition: BirdProps = new BirdProps(120, 0);
    birdVelocity: number = 0;
    paused: boolean = false;
    gameover: boolean = false;
    collision: boolean = false;
    currentPipeToCheck: number = 1;
    score: number = 0;
    highscore: number = 0;
    shouldDing: boolean = false;
    flapWhenOdd: number = 0;
    groundX: number = 0;
    skyX: number = 0;
}

export type Collidable = { x: number, y: number, width: number, height: number, isPipe: boolean };

export const colliding = (object: Collidable, bird: BirdProps) => {
    // calculate horizontal collision
    let horizontalCollision = false;
    const leftObject = object.x;
    const rightObject = object.x + pipeWidth;
    const leftBird = bird.x;
    const rightBird = bird.x + birdSize;
    if (rightBird > leftObject && leftBird < rightObject) horizontalCollision = true;
    // calculate vertical collision
    let verticalCollision = false;
    if (object.isPipe) {
        const halfGap = pipeYGap / 2;
        const topPipeBottom = object.y - halfGap;
        const bottomPipeTop = object.y + halfGap;
        const topBird = bird.y;
        const bottomBird = bird.y + birdSize;
        if (topBird < topPipeBottom || bottomBird > bottomPipeTop) verticalCollision = true;
    } else {
        const topObject = object.y;
        const bottomObject = object.y + object.height;
        const topBird = bird.y;
        const bottomBird = bird.y + birdSize;
        if (bottomBird > topObject && topBird < bottomObject) verticalCollision = true;
    }
    // bird and pipe are colliding if both horizontal and vertical collision occur
    return horizontalCollision && verticalCollision;
};

export const randomPipePosition = (height: number, rng: () => number) =>
    (height / 2) + ((rng() - 0.5) * (height / 2));

export const createPipes = (height: number, rng: () => number): PipeProps[] => {
    let x = 3 * pipeXGap;
    return Utility.array(10).map((v, i) => {
        const pipe = new PipeProps(x, randomPipePosition(height, rng), i + 1);
        x += pipeXGap;
        return pipe;
    });
};

export const incrementScore = (state: FlappyFinchGameState): void => {
    state.score++;
    if (state.highscore < state.score) {
        state.highscore = state.score;
    }
};

export const flap = (state: FlappyFinchGameState): void => {
    state.birdVelocity = flapVelocity;
    state.flapWhenOdd++;
};

// one animation frame: physics, scoring, pipe recycling, scrolling, and floor/pipe game over
export const step = (
    state: FlappyFinchGameState, width: number, height: number, rng: () => number
): FlappyFinchGameState => {
    state.birdPosition.y += state.birdVelocity;
    state.birdVelocity += gravityConstant;
    state.pipePositions.forEach(pipe => {
        if (state.currentPipeToCheck === pipe.index) {
            if (pipe.x + pipeWidth < state.birdPosition.x) {
                state.currentPipeToCheck++;
                incrementScore(state);
            }
            const object = {
                x: pipe.x, y: pipe.y,
                width: pipeWidth, height: height,
                isPipe: true
            };
            state.gameover = colliding(object, state.birdPosition);
        }
        if (pipe.index < state.currentPipeToCheck - 1) {
            pipe.index = Math.max(...state.pipePositions.map(pos => pos.index)) + 1;
            pipe.x = Math.max(...state.pipePositions.map(pos => pos.x)) + pipeXGap;
            pipe.y = randomPipePosition(height, rng);
        }
        pipe.x -= 1;
    });
    [state.groundX, state.skyX] = [state.groundX - 1, state.skyX - 0.5];
    if (state.groundX < -width * 0.625) {
        state.groundX = 0;
    }
    if (state.skyX < -width * 0.5) {
        state.skyX = 0;
    }
    if (state.birdPosition.y > height - (birdSize + 50)) {
        state.gameover = true;
    } else if (state.birdPosition.y < 0) {
        state.birdPosition.y = 0;
    }
    return state;
};
