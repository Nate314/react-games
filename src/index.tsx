import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import SnakeGame from './Snake';
import FloatyStars from './FloatyStars';
import FlappyFinchGame from './FlappyFinch';
import * as serviceWorker from './serviceWorker';

class App extends React.Component {
    render() {
        return (
            <Router>
                <Route path="/" exact component = {SnakeGame} />
                <Route path="/snake" exact component = {SnakeGame} />
                <Route path="/floatystars" exact component = {FloatyStars} />
                <Route path="/flappyfinch" exact component = {FlappyFinchGame} />
            </Router>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
