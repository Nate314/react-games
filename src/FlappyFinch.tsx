import React from 'react';
import './FlappyFinch.css';
import Music from './Music';
import { Utility } from './Utility';
// const getImage = (url: string) => true ? `.${require(url)}` : `${require(url)}`;
const prefix = '.';
const sky58Image = `${prefix}${require('./assets/sky58.png')}`;
const birdImage = `${prefix}${require('./assets/bird.png')}`;
const groundImage = `${prefix}${require('./assets/ground.png')}`;
const pipeImage = `${prefix}${require('./assets/pipe.png')}`;

const frameInterval = 10;
const pipeXGap = 300;
const pipeYGap = 250;  
const pipeWidth = 100;
const gravityConstant = 0.15;
const flapVelocity = -6.25;
const birdSize = 40;
const nomNomSize = 10;
const mp3DingUrl = 'https://freesound.org/data/previews/341/341695_5858296-lq.mp3';
const mp3FlapUrl = 'https://freesound.org/data/previews/244/244980_3008343-lq.mp3';

const colliding = (object: {x: number, y: number, width: number, height: number, isPipe: boolean}, bird: BirdProps) => {
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

class PipeProps {
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
        const height = window.innerHeight;
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
                <img className="pipe" src={pipeImage} style={{ transform:'scale(-1, -1)',
                    top:`${topPipeTop}px`, left:`${this.props.x}px`, width:`${pipeWidth}px`}}></img>
                <img className="pipe" src={pipeImage} style={{ transform:'scale(-1, 1)',
                    top:`${bottomPipeTop}px`, left:`${this.props.x}px`, width:`${pipeWidth}px`}}></img>
            </div>
        )
    };
}

class BirdProps {
    x: number = 0;
    y: number = 0;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Bird extends React.Component {

    props: BirdProps;

    constructor(props: BirdProps) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <img className="bird" src={birdImage}
                style={{left:`${this.props.x}px`, top:`${this.props.y}px`,
                        width:`${birdSize}px`, height:`${birdSize}px`}}></img>
        )
    };
}

class FlappyFinchGameState {
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

export default class FlappyFinchGame extends React.Component {
    randomPipePosition = () => (window.innerHeight / 2) + ((Math.random() - 0.5) * (window.innerHeight / 2));

    state: FlappyFinchGameState;
    props: any;

    constructor(props: any) {
        super(props);
        Utility.setTitle('FlappyFinch');
        this.props = props;
        this.state = new FlappyFinchGameState();
        this.restart();
        setInterval(() => {
            if (!this.state.paused && !this.state.gameover) {
                this.animate();
            }
        }, frameInterval);
    }

    restart() {
        this.state = new FlappyFinchGameState();
        const lshs = localStorage.getItem('nate314.flappyfinch.highScore');
        if (!lshs) {
            localStorage.setItem('nate314.flappyfinch.highScore', JSON.stringify(0));
        }
        this.state.highscore = lshs ? Number(lshs) : 0;
        let x = 3 * pipeXGap;
        let index = 1;
        Utility.array(10).forEach(() => {
            this.state.pipePositions.push(new PipeProps(x, this.randomPipePosition(), index));
            x += pipeXGap;
            index++;
        });
        this.setState(this.state);
    }

    keyDown = (e: any | ' ' | 'Escape' | 'r') => {
        this.setState((state: FlappyFinchGameState) => {
            const k = typeof e === typeof ' ' ? e : e.key;
            switch (k) {
                case ' ':
                    state.birdVelocity = flapVelocity;
                    state.flapWhenOdd++;
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

    componentDidMount() {
        document.addEventListener("keydown", this.keyDown);
    }

    incrementScore() {
        this.state.score++;
        const lshs = localStorage.getItem('nate314.flappyfinch.highScore');
        if (Number(lshs) < this.state.score) {
            this.state.highscore = this.state.score;
            localStorage.setItem('nate314.flappyfinch.highScore', JSON.stringify(this.state.highscore));
        }
    }

    animate() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.setState((state: FlappyFinchGameState) => {
            state.birdPosition.y += state.birdVelocity;
            state.birdVelocity += gravityConstant;
            state.pipePositions.forEach(pipe => {
                if (state.currentPipeToCheck === pipe.index) {
                    if (pipe.x + pipeWidth < this.state.birdPosition.x) {
                        state.currentPipeToCheck++;
                        this.incrementScore();
                    }
                    const object = {
                        x: pipe.x, y: pipe.y,
                        width: pipeWidth, height: height,
                        isPipe: true
                    };
                    state.gameover = colliding(object, this.state.birdPosition);
                }
                if (pipe.index < state.currentPipeToCheck - 1) {
                    pipe.index = Math.max(...state.pipePositions.map(pos => pos.index)) + 1;
                    pipe.x = Math.max(...state.pipePositions.map(pos => pos.x)) + pipeXGap;
                    pipe.y = this.randomPipePosition();
                }
                pipe.x -= 1;
            });
            [state.groundX, state.skyX] = [state.groundX -1, state.skyX - 0.5];
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
            const hs = localStorage.getItem('nate314.flappyfinch.highScore');
            let newHighScore = true;
            if (hs && Number(hs) > state.score) newHighScore = false;
            if (newHighScore) {
                localStorage.setItem('nate314.flappyfinch.highScore', JSON.stringify(state.score));
            }
            return state;
        });
    }

    nomNomEaten(): void {
        this.incrementScore();
        this.state.shouldDing = true;
    }
 
    render() {
        const ding = this.state.shouldDing;
        const flap = this.state.flapWhenOdd;
        this.state.shouldDing = false
        this.state.flapWhenOdd += Utility.isOdd(this.state.flapWhenOdd) ? 1 : 0;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const pipes = this.state.pipePositions.map((pipe, i) => 
            <Pipe key={`pipe${i}`}
                x={pipe.x} y={pipe.y} index={pipe.index}
                birdPosition={this.state.birdPosition} onNomNom={() => this.nomNomEaten()}/>
        );
        const gamestatus = (this.state.paused || this.state.gameover || this.state.collision) ?
            <div className="paused">{this.state.gameover ? 'GAME OVER' : 'PAUSED'}</div> : '';
        const ground = Utility.array(5).map((v, i) =>
            <img key={`background${i}`}
                className="ground" src={groundImage}
                style={{top:`${height - 50}px`, left:`${this.state.groundX + (i * width * 0.625)}px`, height:'50px',
                color:'white', textAlign:'left', fontSize:'20px'}}></img>
        );
        const background = Utility.array(5).map((v, i) =>
            <img key={`background${i}`}
                className="background" src={sky58Image}
                style={{left: `${10 + this.state.skyX + (i * width * 0.5)}px`}}></img>
        );
        const scoreboard = <div className="scoreboard">
                &nbsp;&nbsp;&nbsp;Score:&nbsp;{this.state.score}
                <br />
                &nbsp;&nbsp;&nbsp;High Score:&nbsp;{this.state.highscore}
                <br />
                &nbsp;&nbsp;&nbsp;
                <span onClick={() => this.keyDown('r')}>
                    (r) Reset
                </span>
                &nbsp;|&nbsp;
                <span onClick={() => this.keyDown('Escape')}>
                    (Escape) Pause
                </span>
                &nbsp;|&nbsp;
                <span>
                    (Space) Flap
                </span>
            </div>;
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
