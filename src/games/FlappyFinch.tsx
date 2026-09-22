import React from 'react';
import './FlappyFinch.css';
import Music from '../Music';
import { GameHud } from '../components/GameHud';
import { Utility } from '../Utility';
import type { GameProps, StageSize } from '../stage';
import {
    BirdProps, PipeProps, FlappyFinchGameState, frameInterval, pipeWidth, pipeYGap, birdSize,
    nomNomSize, colliding, createPipes, incrementScore, flap, rescale, step
} from './FlappyFinch.logic';

// Self-hosted (originally from freesound.org) so the game doesn't depend on a third-party CDN.
const mp3DingUrl = '/assets/flappyfinch/ding.mp3';
const mp3FlapUrl = '/assets/flappyfinch/flap.mp3';
const highScoreKey = 'nate314.flappyfinch.highScore';

class NomNomProps {
    x: number = 0;
    y: number = 0;
}

class NomNom extends React.Component {

    props: NomNomProps;

    constructor(props: NomNomProps) {
        super(props);
        this.props = props;
    }

    render() {
        const halfNomNomSize = nomNomSize / 2;
        return (
            <div>
                <div className="nomnom" style={{position:'absolute',
                    width:`${nomNomSize}px`, height:`${nomNomSize}px`,
                    top:`${this.props.y - halfNomNomSize}px`,
                    left:`${this.props.x}px`}}>
                </div>
            </div>
        )
    };
}

class Pipe extends React.Component {

    nomNomEaten: boolean = false;
    nomNomProps: NomNomProps;
    props: PipeProps;

    constructor(props: PipeProps) {
        super(props);
        this.props = props;
        this.nomNomProps = new NomNomProps();
    }

    render() {
        const height = this.props.stageHeight;
        const halfGap = pipeYGap / 2;
        const topPipeTop = (this.props.y - height) - halfGap;
        const bottomPipeTop = this.props.y + halfGap;
        this.nomNomProps.x = this.props.x + (pipeWidth / 2);
        if (this.nomNomProps.y === 0) {
            const topPipeBottom = topPipeTop + height;
            this.nomNomProps.y = topPipeBottom + (Math.random() * (bottomPipeTop - topPipeBottom));
        }
        const object = {
            x: this.nomNomProps.x,
            y: this.nomNomProps.y,
            width: nomNomSize,
            height: nomNomSize,
            isPipe: false
        };
        if (!this.nomNomEaten && colliding(object, this.props.birdPosition)) {
            this.props.onNomNom();
            this.nomNomEaten = true;
        }
        return (
            <div>
                {this.nomNomEaten ? '' : <NomNom x={this.nomNomProps.x} y={this.nomNomProps.y}/>}
                <img alt="" className="pipe" src="assets/flappyfinch/pipe.png" style={{ transform:'scale(-1, -1)',
                    top:`${topPipeTop}px`, left:`${this.props.x}px`, width:`${pipeWidth}px`}}></img>
                <img alt="" className="pipe" src="assets/flappyfinch/pipe.png" style={{ transform:'scale(-1, 1)',
                    top:`${bottomPipeTop}px`, left:`${this.props.x}px`, width:`${pipeWidth}px`}}></img>
            </div>
        )
    };
}

class Bird extends React.Component {

    props: BirdProps;

    constructor(props: BirdProps) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <img alt="" className="bird" src="assets/flappyfinch/bird.png"
                style={{left:`${this.props.x}px`, top:`${this.props.y}px`,
                        width:`${birdSize}px`, height:`${birdSize}px`}}></img>
        )
    };
}

export default class FlappyFinchGame extends React.Component<GameProps> {
    state: FlappyFinchGameState;
    lastStage: StageSize;

    constructor(props: GameProps) {
        super(props);
        Utility.setTitle('FlappyFinch');
        this.lastStage = props.stage;
        this.state = new FlappyFinchGameState();
        this.resetState();
        setInterval(() => {
            if (!this.state.paused && !this.state.gameover) {
                this.animate();
            }
        }, frameInterval);
    }

    restart() {
        this.resetState();
        this.setState(this.state);
    }

    resetState() {
        this.state = new FlappyFinchGameState();
        const lshs = localStorage.getItem(highScoreKey);
        if (!lshs) {
            localStorage.setItem(highScoreKey, JSON.stringify(0));
        }
        this.state.highscore = lshs ? Number(lshs) : 0;
        this.state.pipePositions = createPipes(this.props.stage.height, Math.random);
    }

    keyDown = (e: any | ' ' | 'Escape' | 'r') => {
        this.setState((state: FlappyFinchGameState) => {
            const k = typeof e === typeof ' ' ? e : e.key;
            switch (k) {
                case ' ':
                    flap(state);
                    break;
                case 'Escape':
                    state.paused = !state.paused;
                    break;
                case 'r':
                case 'R':
                    this.restart();
                    break;
            }
            return state;
        });
    }

    // re-lays out the running game when the stage size changes, without resetting it
    applyStage() {
        if (this.lastStage !== this.props.stage) {
            rescale(this.state, this.lastStage, this.props.stage);
            this.lastStage = this.props.stage;
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyDown);
    }

    // keeps the stored high score in step with the game state (never lowers it)
    persistHighScore() {
        const hs = localStorage.getItem(highScoreKey);
        if (!hs || Number(hs) <= this.state.score) {
            localStorage.setItem(highScoreKey, JSON.stringify(this.state.highscore));
        }
    }

    animate() {
        const { width, height } = this.props.stage;
        this.setState((state: FlappyFinchGameState) => {
            step(state, width, height, Math.random);
            this.persistHighScore();
            return state;
        });
    }

    nomNomEaten(): void {
        incrementScore(this.state);
        this.persistHighScore();
        this.state.shouldDing = true;
    }
 
    render() {
        const ding = this.state.shouldDing;
        const flap = this.state.flapWhenOdd;
        this.state.shouldDing = false
        this.state.flapWhenOdd += Utility.isOdd(this.state.flapWhenOdd) ? 1 : 0;
        this.applyStage();
        const { width, height } = this.props.stage;
        const pipes = this.state.pipePositions.map((pipe, i) => 
            <Pipe key={`pipe${i}-${height}`} stageHeight={height}
                x={pipe.x} y={pipe.y} index={pipe.index}
                birdPosition={this.state.birdPosition} onNomNom={() => this.nomNomEaten()}/>
        );
        const gamestatus = (this.state.paused || this.state.gameover || this.state.collision) ?
            <div className="paused">{this.state.gameover ? 'GAME OVER' : 'PAUSED'}</div> : '';
        const ground = Utility.array(5).map((v, i) =>
            <img alt="" key={`background${i}`}
                className="ground" src="assets/flappyfinch/ground.png"
                style={{top:`${height - 50}px`, left:`${this.state.groundX + (i * width * 0.625)}px`, height:'50px',
                color:'white', textAlign:'left', fontSize:'20px'}}></img>
        );
        const background = Utility.array(5).map((v, i) =>
            <img alt="" key={`background${i}`}
                className="background" src="assets/flappyfinch/sky58.png"
                style={{left: `${10 + this.state.skyX + (i * width * 0.5)}px`}}></img>
        );
        const scoreboard = <GameHud variant="overlay"
            stats={[
                { label: 'Score', value: this.state.score },
                { label: 'High Score', value: this.state.highscore }
            ]}
            controls={[
                { keys: 'R', action: 'Reset' },
                { keys: 'Esc', action: 'Pause' },
                { keys: 'Space', action: 'Flap' }
            ]}/>;
        const shouldPlayFlapSound = (i: number) => Utility.isOdd(flap)
            ? (this.state.paused || this.state.gameover
                ? false : Math.floor(flap / 2) % 4 === i)
            : false;
        return (
            <div className="game" onClick={() => this.keyDown(' ')}>
                {background}
                <Music url={mp3DingUrl} play={ding}/>
                {/* Allows flap sound to be played multiple times */}
                <Music url={mp3FlapUrl} play={shouldPlayFlapSound(0)}/>
                <Music url={mp3FlapUrl} play={shouldPlayFlapSound(1)}/>
                <Music url={mp3FlapUrl} play={shouldPlayFlapSound(2)}/>
                <Music url={mp3FlapUrl} play={shouldPlayFlapSound(3)}/>
                {/* Allows flap sound to be played multiple times */}
                <Bird x={this.state.birdPosition.x} y={this.state.birdPosition.y}/>
                {pipes}
                {gamestatus}
                {ground}
                {scoreboard}
            </div>
        );
    }
}
