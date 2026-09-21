import React from 'react';
import './Snake.css';
import { Utility } from '../Utility';
import {
    advanceSnake, boardHeight, boardWidth, initialSnakeState, nextDirection, type SnakeState
} from './Snake.logic';

let squareSize = 0;

class BoardProps {
    snakeBody: number[][] = [];
    snakeHead: number[] = [];
    food: number[] = [];
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

export default class SnakeGame extends React.Component {

    currentDirection: string;
    interval: any;
    state: SnakeState;

    constructor(props: any) {
        super(props);
        Utility.setTitle('Snake');
        this.state = initialSnakeState();
        this.currentDirection = this.state.snakeDirection;
        this.interval = setInterval(() => this.gameTick(), this.state.gameTickInterval);
    }

    gameTick() {
        let ate = false;
        this.setState((state: SnakeState) => {
            if (state.paused || state.gameover) return state;
            // move snake in direction set by keyDown method
            this.currentDirection = state.snakeDirection;
            const next = advanceSnake(state, Math.random);
            ate = next.score > state.score;
            if (next.gameover) {
                const hs = localStorage.getItem('nate314.snake.highScore');
                let newHighScore = true;
                if (hs && Number(hs) > next.score) newHighScore = false;
                if (newHighScore) {
                    localStorage.setItem('nate314.snake.highScore', JSON.stringify(next.score));
                }
            }
            return next;
        }, () => {
            // eating restarts the tick timer, as it did before
            if (ate) this.restartInterval(this.state.gameTickInterval);
        });
    }

    restartInterval(ms: number) {
        clearInterval(this.interval);
        this.interval = setInterval(() => this.gameTick(), ms);
    }

    keyDown = (e: any) => {
        this.setState((state: SnakeState) => {
            const k = e.key;
            let next = { ...state, snakeDirection: nextDirection(this.currentDirection, k) };
            if (k === 'Escape') next.paused = !next.paused;
            if (['r', 'R'].includes(k)) {
                clearInterval(this.interval);
                next = initialSnakeState();
                this.interval = setInterval(() => this.gameTick(), next.gameTickInterval);
            }
            return next;
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyDown);
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
