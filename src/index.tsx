// React Components
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
// Games
import SnakeGame from './Snake';
import FloatyStars from './FloatyStars';
import FlappyFinchGame from './FlappyFinch';
import GameOfLife from './GameOfLife';
import Tetris from './Tetris';
// Material Design
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

class Game {
    title: string = '';
    image: string = '';
    url: string = '';
    reactcomponent: any = undefined;
    constructor(title: string, image: string, url: string, reactcomponent: any) {
        this.title = title;
        this.image = image;
        this.url = url;
        this.reactcomponent = reactcomponent;
    }
}

const games = [
    new Game('Snake', 'assets/menu/snake.gif', '/snake', SnakeGame),
    new Game('FloatyStars', 'assets/menu/floatystars.gif', '/floatystars', FloatyStars),
    new Game('FlappyFinch', 'assets/menu/flappyfinch.gif', '/flappyfinch', FlappyFinchGame),
    new Game('GameOfLife', 'assets/menu/gameoflife.gif', '/gameoflife', GameOfLife),
    new Game('Tetris', 'assets/menu/tetris.gif', '/tetris', Tetris)
];

function GameCard(props: {title: string, image: string, url: string}) {
    return (
        <Card>
            <CardActionArea>
                <CardMedia style={{height:150}} image={props.image}
                    title={`Image of ${props.title} game`} />
            </CardActionArea>
            <CardActions>
                <div className="container row">
                    <div className="col-7">
                        <Typography gutterBottom
                            variant="h5" component="h2"
                        >
                            {props.title}
                        </Typography>
                    </div>
                    <div className="col-5">
                        <Button size="small" color="primary"
                            onClick={() => document.location.pathname = props.url}
                        >
                            Play Game
                        </Button>
                    </div>
                </div>
            </CardActions>
        </Card>
    );
};


class Index extends React.Component {
    render() {
        return (
            <div style={{backgroundColor: "#AAAAAA", height: "100vh"}}>
                <div className="container">
                    <br />
                    <Card>
                        <CardContent>
                            <Typography component="p">
                                I have written a few games here in an effort
                                to learn how <a href="https://reactjs.org/">reactjs</a> works.
                                Listed below are the games that I have created. Many of them
                                are rip-offs of common games.
                            </Typography>
                        </CardContent>
                    </Card>
                    <br />
                    <div className="row">
                    {
                        games.map(game =>
                            <div key="game.title" className="col-4">
                                <GameCard title={game.title}
                                    image={game.image} url={game.url} />
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

class App extends React.Component {
    render() {
        return (
            <BrowserRouter basename={'/'}>
                <Route path="/" exact component={Index} />
                {
                    games.map(game =>
                        <Route key={game.url} path={game.url} exact component={game.reactcomponent} />
                    )
                }
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
