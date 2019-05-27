import React from 'react';

class MusicProps {
    url: string = '';
    play: boolean = false;
}

class MusicState {
    audio: HTMLAudioElement = new Audio('');
    play: boolean = false;
}

class Music extends React.Component {
    state: MusicState;
    props: MusicProps;

    constructor(props: MusicProps) {
        super(props);
        this.props = props;
        this.state = new MusicState();
        this.state.audio = new Audio(this.props.url);
        this.setState(this.state);
    }
  
    // togglePlay = () => {
            // this.setState({ play: !this.state.play }, () => {
            //     this.state.play ? this.state.audio.play() : this.state.audio.pause();
            //   });
    // }
  
    render() {
        if (this.props.play) {
            this.state.audio.play()
        }
        return (
            <div>
            {/* <button onClick={() => console.log}>{this.state.play ? 'Pause' : 'Play'}</button> */}
            </div>
        );
    }
  }
  
  export default Music;
