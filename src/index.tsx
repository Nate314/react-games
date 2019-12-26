// React Components
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
// Games
import SnakeGame from './games/Snake';
import FloatyStars from './games/FloatyStars';
import FlappyFinchGame from './games/FlappyFinch';
import GameOfLife from './games/GameOfLife';
import Tetris from './games/Tetris';
// Material Design
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

class Game {
    title: string = '';
    image: string = '';
    gif: string = '';
    url: string = '';
    reactcomponent: any = undefined;
    constructor(title: string, image: string, gif: string, url: string, reactcomponent: any) {
        this.title = title;
        this.image = image;
        this.gif = gif;
        this.url = url;
        this.reactcomponent = reactcomponent;
    }
}

const games = [
    new Game('Snake', 'assets/menu/snake.png', 'assets/menu/snake.gif', '/snake', SnakeGame),
    new Game('FloatyStars', 'assets/menu/floatystars.png', 'assets/menu/floatystars.gif', '/floatystars', FloatyStars),
    new Game('FlappyFinch', 'assets/menu/flappyfinch.png', 'assets/menu/flappyfinch.gif', '/flappyfinch', FlappyFinchGame),
    new Game('GameOfLife', 'assets/menu/gameoflife.png', 'assets/menu/gameoflife.gif', '/gameoflife', GameOfLife),
    new Game('Tetris', 'assets/menu/tetris.png', 'assets/menu/tetris.gif', '/tetris', Tetris)
];

function GameCard(props: Game) {
    const [isHover, setIsHover] = useState(false);
    const getImage = () => isHover ? props.gif : props.image;
    return (
        <Card elevation={5}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}>
            <CardActionArea>
                <CardMedia style={{height:150}} image={getImage()}
                    title={`Image of ${props.title} game`} />
            </CardActionArea>
            <CardActions>
                <div className="container">
                    <div>
                        <Typography gutterBottom
                            variant="h5" component="h2"
                        >
                            {props.title}
                        </Typography>
                    </div>
                    <div style={{textAlign:"right"}}>
                        <Button size="small" color="primary"
                            onClick={() => window.location.pathname = props.url}
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
                            <div key={game.title} className={columnClass}>
                                <br />
                                <GameCard title={game.title} url={game.url}
                                    image={game.image} gif={game.gif}
                                    reactcomponent={undefined}/>
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
                <Switch>
                    <Route path="/" exact component={Index} />
                    {
                        games.map(game =>
                            <Route key={game.url} path={game.url} exact component={game.reactcomponent} />
                        )
                    }
                    {
                        games.map(g => g.url).includes(window.location.pathname)
                        ? document.getElementsByTagName('body')[0].style.backgroundColor = '#FFFFFF'
                        : document.getElementsByTagName('body')[0].style.backgroundColor = '#AAAAAA'
                    }
                    <Route path="*" exact component={() => {
                        return (
                            <div style={{backgroundColor: "#AAAAAA"}}>
                                <br />
                                <div className="container">
                                    <Card>
                                        <CardContent>
                                            <Typography component="p">
                                                ¯\_(ツ)_/¯ NOT FOUND
                                                <br />
                                                <Link to="/">Go back home</Link>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        );
                    }} />
                </Switch>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
