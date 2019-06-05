import {
    BrowserRouter as Router,
    Route, Link
} from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import SnakeGame from './Snake';
import FloatyStars from './FloatyStars';
import FlappyFinchGame from './FlappyFinch';
import GameOfLife from './GameOfLife';
import * as serviceWorker from './serviceWorker';

const production = true;

class Game {
    title: string = '';
    url: string = '';
    reactcomponent: any = undefined;
    constructor(title: string, url: string, reactcomponent: any) {
        this.title = title;
        this.url = url;
        this.reactcomponent = reactcomponent;
    }
}

const games = [
    new Game('Snake', '/snake', SnakeGame),
    new Game('FloatyStars', '/floatystars', FloatyStars),
    new Game('FlappyFinch', '/flappyfinch', FlappyFinchGame),
    new Game('GameOfLife', '/gameoflife', GameOfLife)
]

class Index extends React.Component {
    render() {
        return (
            <div>
                I have written a few games here to learn <a href="https://reactjs.org/">reactjs</a>.
                Listed below are the games that I have written in order.
                <br />
                {
                    games.map(game =>
                        <div key="game.title">
                            <Link to={game.url}>{game.title}</Link>
                            <br />
                        </div>
                    )
                }
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        return (
            <Router basename={production ? '/react-games/' : '/'}>
                <Route path="/" exact component={Index} />
                {
                    games.map(game =>
                        <Route key={game.url} path={game.url} exact component={game.reactcomponent} />
                    )
                }
            </Router>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
