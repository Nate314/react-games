// React Components
import { Component, useState } from 'react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
// Games
import SnakeGame from './games/Snake';
import FloatyStars from './games/FloatyStars';
import FlappyFinchGame from './games/FlappyFinch';
import GameOfLife from './games/GameOfLife';
import Tetris from './games/Tetris';
class Game {
    title: string = '';
    image: string = '';
    gif: string = '';
    url: string = '';
    reactcomponent: ComponentType;
    constructor(title: string, image: string, gif: string, url: string, reactcomponent: ComponentType) {
        this.title = title;
        this.image = image;
        this.gif = gif;
        this.url = url;
        this.reactcomponent = reactcomponent;
    }
}

const games = [
    new Game('Snake', '/assets/menu/snake.png', '/assets/menu/snake.gif', '/snake', SnakeGame),
    new Game('FloatyStars', '/assets/menu/floatystars.png', '/assets/menu/floatystars.gif', '/floatystars', FloatyStars),
    new Game('FlappyFinch', '/assets/menu/flappyfinch.png', '/assets/menu/flappyfinch.gif', '/flappyfinch', FlappyFinchGame),
    new Game('GameOfLife', '/assets/menu/gameoflife.png', '/assets/menu/gameoflife.gif', '/gameoflife', GameOfLife),
    new Game('Tetris', '/assets/menu/tetris.png', '/assets/menu/tetris.gif', '/tetris', Tetris)
];

function GameCard(props: Omit<Game, "reactcomponent">) {
    const [isHover, setIsHover] = useState(false);
    const getImage = () => isHover ? props.gif : props.image;
    return (
        <div className="card"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}>
            <div role="img" aria-label={`Image of ${props.title} game`}
                style={{height: 150, backgroundImage: `url(${getImage()})`, backgroundSize: 'cover', backgroundPosition: 'center'}} />
            <div className="container">
                <div>
                    <h2>{props.title}</h2>
                </div>
                <div style={{textAlign: 'right'}}>
                    <button type="button"
                        onClick={() => window.location.pathname = props.url}
                    >
                        Play Game
                    </button>
                </div>
            </div>
        </div>
    );
}

class Index extends Component {
    updateDimensions = () => this.setState({ width: window.innerWidth, height: window.innerHeight });
    componentDidMount = () => window.addEventListener('resize', this.updateDimensions);
    componentWillUnmount = () => window.removeEventListener('resize', this.updateDimensions);
    render() {
        const width: number = window.innerWidth;
        let columnClass: string = width < 1200 ?
            (width < 992 ? (width < 768 ? 'col-12'
                : 'col-6') : 'col-4') : 'col-3';
        return (
            <div style={{backgroundColor: "#AAAAAA", height: "100vh"}}>
                <div className="container">
                    <br />
                    <div className="card">
                            <p>
                                I have written a few games here in an effort
                                to learn how <a href="https://reactjs.org/">reactjs</a> works.
                                Listed below are the games that I have created. Many of them
                                are rip-offs of common games.
                            </p>
                    </div>
                    <br />
                    <div className="row">
                    {
                        games.map(game =>
                            <div key={game.title} className={columnClass}>
                                <br />
                                <GameCard title={game.title} url={game.url}
                                    image={game.image} gif={game.gif} />
                                <br />
                            </div>
                        )
                    }
                    </div>
                </div>
            </div>
        );
    }
}

function App() {
    const isGamePath = games.map(g => g.url).includes(window.location.pathname);
    document.body.style.backgroundColor = isGamePath ? '#FFFFFF' : '#AAAAAA';
    return (
        <BrowserRouter basename={'/'}>
            <Routes>
                <Route path="/" element={<Index />} />
                {
                    games.map(game => {
                        const GameComponent = game.reactcomponent;
                        return <Route key={game.url} path={game.url} element={<GameComponent />} />;
                    })
                }
                <Route path="*" element={
                    <div style={{backgroundColor: "#AAAAAA"}}>
                        <br />
                        <div className="container">
                            <div className="card">
                                <p>
                                    ¯\_(ツ)_/¯ NOT FOUND
                                    <br />
                                    <Link to="/">Go back home</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
