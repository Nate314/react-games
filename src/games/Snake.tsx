import React from 'react';
import './Snake.css';
import { Utility } from '../Utility';
import { GameHud } from '../components/GameHud';
import { fitSquareSize } from './boardSize';
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
        squareSize = fitSquareSize(boardWidth, boardHeight);
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
        // show board and HUD on the screen
        return (
            <div>
                <Board
                    snakeBody={this.state.snakeBody}
                    snakeHead={this.state.snakeHeadPosition}
                    food={this.state.foodPosition}
                />
                <GameHud
                    width={boardWidth * squareSize}
                    stats={[
                        { label: 'Score', value: this.state.score },
                        { label: 'High Score', value: highscore },
                    ]}
                    status={
                        this.state.paused ? { text: 'Paused', tone: 'info' }
                        : this.state.gameover ? { text: 'Game Over', tone: 'danger' }
                        : null
                    }
                    controls={[
                        { keys: 'R', action: 'Reset' },
                        { keys: 'WASD / Arrows', action: 'Move' },
                        { keys: 'Esc', action: 'Pause' },
                    ]}
                />
            </div>
        );
    }
}
