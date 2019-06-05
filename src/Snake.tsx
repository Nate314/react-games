import React from 'react';
import './Snake.css';
import { Utility } from './Utility';

const boardWidth = 30;
const boardHeight = 20;
let squareSize = 0;
const randomPosition = () => [Math.floor(Math.random() * boardHeight), Math.floor(Math.random() * boardWidth)];

class BoardProps {
    snakeBody: number[][] = [];
    snakeHead: number[] = [];
    food: number[] = [];
    onEat: any;
}

class Board extends React.Component {

    snakeHeadColor = 'blue';
    snakeBodyColor = 'green';
    foodColor = 'red';
    boardColor = 'black';
    props: BoardProps;

    constructor(props: BoardProps) {
        super(props);
        this.props = props;
    }

    render() {
        // building array to figure out the color for each square
        const squareColors: string[][] = Utility.array(boardHeight).map((v, rowindex) =>
            Utility.array(boardWidth).map((v, columnindex) => {
                let color;
                this.props.snakeBody.forEach(bodyPart => {
                    if (Utility.arePositionsEqual(bodyPart, [rowindex, columnindex]))
                        color = this.snakeBodyColor;
                });
                if (Utility.arePositionsEqual(this.props.food, [rowindex, columnindex]))
                    color = this.foodColor;
                else if (Utility.arePositionsEqual(this.props.snakeHead, [rowindex, columnindex]))
                    color = this.snakeHeadColor;
                else if (!color)
                    color = this.boardColor;
                return color;
            })
        );
        // trigger onEat event if the head is on top of food
        if (Utility.arePositionsEqual(this.props.snakeHead, this.props.food)) this.props.onEat();
        // calculating square size
        const maxWidth = Math.floor((window.innerWidth - 100) / boardWidth);
        const maxHeight = Math.floor((window.innerHeight - 100) / boardHeight);
        squareSize = Math.min(maxWidth, maxHeight);
        // return rendered board
        return (
            <div>
                {
                    Utility.array(boardHeight).map((row, rowindex) =>
                        <div className="board-row" key={`row-${rowindex}`}>
                            {
                                Utility.array(boardWidth).map((row, columnindex) =>
                                    <div className="snakesquare" key={`square-${rowindex}-${columnindex}`}
                                        style={
                                            {backgroundColor: squareColors[rowindex][columnindex],
                                            width: `${squareSize}px`, height: `${squareSize}px`}
                                        }>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>
        );
    }
}

class ScoreBoardProps {
    score: number = 0;
    highscore: number = 0;
    paused: boolean = false;
    gameover: boolean = false;
}

class ScoreBoard extends React.Component {

    props: ScoreBoardProps;

    constructor(props: ScoreBoardProps) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    <div className="snakesquare" style={{width: `${squareSize * (boardWidth / 2)}px`}}>
                        Score: {this.props.score}
                    </div>
                    <div className="snakesquare" style={{width: `${squareSize * (boardWidth / 2)}px`}}>
                        {
                            this.props.paused ?
                            <div style={{color:'green'}}><b>Paused</b></div>
                            : this.props.gameover ?
                            <div style={{color:'red'}}><b>Game Over</b></div>
                            : `High Score: ${this.props.highscore}`
                        }
                    </div>
                </div>
                <div className="board-row">
                    <div className="snakesquare" style={{width: `${boardWidth * (squareSize)}px`}}>
                        (r) Reset | (WASD, Arrow Keys) move snake | (esc) Escape
                    </div>
                </div>
            </div>
        );
    }
}

class GameState {
    paused: boolean = false;
    gameover: boolean = false;
    score: number = 0;
    snakeDirection: string = '>';
    snakeHeadPosition: number[] = [boardHeight / 2, 3];
    snakeBody: number[][] = [];
    foodPosition: number[] = [boardHeight / 2, boardWidth / 2];
    snakeLength: number = 1;
    gameTickInterval: number = 110;
}

export default class SnakeGame extends React.Component {

    gameTickDelta: number = 0;
    snakeLengthDelta: number = 3;
    scoreDelta: number = 5;
    currentDirection: string;
    interval: any;
    state: GameState;

    constructor(props: any) {
        super(props);
        Utility.setTitle('Snake');
        const tempState = new GameState();
        this.state = tempState;
        this.currentDirection = this.state.snakeDirection;
        this.setState(tempState);
        this.interval = setInterval(() => this.gameTick(), this.state.gameTickInterval);
    }

    gameTick() {
        this.setState((state: GameState) => {
            if (!state.paused && !state.gameover) {
                // move snake in direction set by keyDown method
                const dir = state.snakeDirection;
                this.currentDirection = dir;
                let [y, x] = state.snakeHeadPosition;
                state.snakeBody.push([y, x]);
                x = dir === '<' ? x - 1 : dir === '>' ? x + 1 : x;
                y = dir === '^' ? y - 1 : dir === 'v' ? y + 1 : y;
                // check for collisions and set new positions
                if (y < 0 || y > boardHeight - 1 || x < 0 || x > boardWidth - 1) {
                    state.gameover = true;
                } else {
                    state.snakeHeadPosition = [y, x];
                    state.snakeBody = Utility.array(state.snakeBody.length, [-1, -1]).concat(state.snakeBody);
                    state.snakeBody = state.snakeBody.slice(state.snakeBody.length - state.snakeLength);
                    state.snakeBody.forEach((bodyPart, i) => {
                        if (Utility.arePositionsEqual(bodyPart, state.snakeHeadPosition)) state.gameover = true;
                    });
                }
                if (state.gameover) {
                    const hs = localStorage.getItem('nate314.snake.highScore');
                    let newHighScore = true;
                    if (hs && Number(hs) > state.score) newHighScore = false;
                    if (newHighScore) {
                        localStorage.setItem('nate314.snake.highScore', JSON.stringify(state.score));
                    }
                }
            }
            return state;
        });
    }

    keyDown = (e: any) => {
        this.setState((state: GameState) => {
            const k = e.key;
            // set the direction based on the key pressed
            state.snakeDirection =
                !['^', 'v'].includes(this.currentDirection) ?
                    ((k === 'ArrowUp' || k === 'W' || k === 'w') ? '^' :
                    (k === 'ArrowDown' || k === 'S' || k === 's') ? 'v' : this.currentDirection) :
                !['<', '>'].includes(this.currentDirection) ?
                    ((k === 'ArrowLeft' || k === 'A' || k === 'a') ? '<' :
                    (k === 'ArrowRight' || k === 'D' || k === 'd') ? '>' : this.currentDirection)
                : this.currentDirection;
            if (k === 'Escape') state.paused = !state.paused;
            if (['r', 'R'].includes(k)) {
                clearInterval(this.interval);
                state = new GameState();
                this.interval = setInterval(() => this.gameTick(), state.gameTickInterval);
            }
            return state;
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyDown);
    }

    eatFood() {
        this.setState((state: GameState) => {
            // move food and increment the snake's length
            while (true) {
                state.foodPosition = randomPosition();
                let isFoodInBody = false;
                state.snakeBody.forEach(bodyPart => {
                    if (Utility.arePositionsEqual(state.foodPosition, bodyPart)) isFoodInBody = true;
                });
                if (!isFoodInBody) break;
            }
            state.snakeLength += this.snakeLengthDelta;
            state.score += this.scoreDelta;
            state.gameTickInterval -= this.gameTickDelta;
            clearInterval(this.interval);
            this.interval = setInterval(() => this.gameTick(), state.gameTickInterval);
            return state;
        });
    }

    render() {
        let highscore = Number(localStorage.getItem('nate314.snake.highScore'));
        highscore = isNaN(highscore) ? 0 : highscore;
        // show board and scoreboard on the screen
        return (
            <div>
                <Board
                    snakeBody={this.state.snakeBody}
                    snakeHead={this.state.snakeHeadPosition}
                    food={this.state.foodPosition}
                    onEat={() => this.eatFood()}
                />
                <ScoreBoard
                    score={this.state.score}
                    highscore={highscore}
                    paused={this.state.paused}
                    gameover={this.state.gameover}
                />
            </div>
        );
    }
}
